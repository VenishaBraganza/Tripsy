import { Client } from "pg"

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function setupDatabase() {
  try {
    await client.connect()
    console.log("[Tripsy] Connected to database")

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

    // 1. Profiles Table (extends Supabase Auth)
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'operator', 'admin')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("[Tripsy] Checked/Created profiles table")

    // 2. Packages Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        duration TEXT NOT NULL,
        image_url TEXT NOT NULL,
        location TEXT NOT NULL,
        rating DECIMAL(2, 1) DEFAULT 0,
        features JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("[Tripsy] Checked/Created packages table")

    // 3. Bookings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        booking_date TIMESTAMPTZ DEFAULT NOW(),
        travel_date TIMESTAMPTZ NOT NULL,
        guests INTEGER NOT NULL DEFAULT 1,
        total_price DECIMAL(10, 2) NOT NULL
      );
    `)
    console.log("[Tripsy] Checked/Created bookings table")

    // 4. Reviews Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("[Tripsy] Checked/Created reviews table")

    // Seed Data for Packages
    const packagesCount = await client.query("SELECT COUNT(*) FROM packages")
    if (Number.parseInt(packagesCount.rows[0].count) === 0) {
      console.log("[Tripsy] Seeding packages...")
      const seedPackages = [
        {
          title: "Spirit Realm Bathhouse Stay",
          description:
            "Experience the magical bathhouse from Spirited Away. Relax in herbal waters and enjoy the finest spirit hospitality.",
          price: 450.0,
          duration: "3 Days / 2 Nights",
          image_url: "/public/ghibli-style-landscape-lush-green-clouds.jpg", // Using placeholder
          location: "Mysterious Town",
          rating: 4.9,
          features: JSON.stringify(["Herbal Baths", "Spirit Feast", "Train Ticket"]),
        },
        {
          title: "Totoro's Forest Retreat",
          description:
            "Stay in a cozy countryside house near the giant camphor tree. Keep an eye out for soot sprites and forest spirits!",
          price: 320.0,
          duration: "2 Days / 1 Night",
          image_url: "/public/japanese-countryside-totoro-house.jpg", // Using placeholder
          location: "Sayama Hills",
          rating: 4.8,
          features: JSON.stringify(["Catbus Tour", "Acorn Planting", "Country Living"]),
        },
        {
          title: "Laputa Sky Castle Tour",
          description:
            "A journey to the castle in the sky. Explore ancient robots, lush gardens, and the floating city.",
          price: 800.0,
          duration: "1 Day",
          image_url: "/public/clouds-pattern-texture.jpg", // Using placeholder
          location: "The Sky",
          rating: 5.0,
          features: JSON.stringify(["Airship Ride", "Robot Encounter", "Cloud Gazing"]),
        },
        {
          title: "Seaside Town Adventure",
          description:
            "Visit the beautiful seaside town from Kiki's Delivery Service. Fly a broom (optional) and deliver packages!",
          price: 280.0,
          duration: "4 Days / 3 Nights",
          image_url: "/public/seaside-town-red-plane-ghibli.jpg", // Using placeholder
          location: "Koriko",
          rating: 4.7,
          features: JSON.stringify(["Bakery Visit", "Broom Flying Lesson", "Seaside Views"]),
        },
      ]

      for (const pkg of seedPackages) {
        await client.query(
          `INSERT INTO packages (title, description, price, duration, image_url, location, rating, features)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [pkg.title, pkg.description, pkg.price, pkg.duration, pkg.image_url, pkg.location, pkg.rating, pkg.features],
        )
      }
      console.log("[Tripsy] Seeded packages")
    }

    // Create Trigger to handle new user creation in Supabase Auth -> Profiles
    // This is a common pattern for Supabase
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, avatar_url)
        VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `)
    console.log("[Tripsy] Created auth trigger")
  } catch (err) {
    console.error("[Tripsy] Error setting up database:", err)
  } finally {
    await client.end()
    console.log("[Tripsy] Database setup complete")
  }
}

setupDatabase()
