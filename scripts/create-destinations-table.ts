import { Client } from "pg"

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function createDestinationsTable() {
  try {
    await client.connect()
    console.log("[Tripsy] Connected to database")

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

    // Create destinations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        short_description TEXT,
        location TEXT NOT NULL,
        region TEXT,
        image_url TEXT NOT NULL,
        gallery_images TEXT[] DEFAULT '{}',
        highlights TEXT[] DEFAULT '{}',
        best_time_to_visit TEXT,
        difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'challenging')),
        min_price DECIMAL(10, 2),
        max_price DECIMAL(10, 2),
        popularity_score INTEGER DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        average_rating DECIMAL(2, 1) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("[Tripsy] Created destinations table")

    // Create tour_packages table with destination reference
    await client.query(`
      CREATE TABLE IF NOT EXISTS tour_packages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        duration_days INTEGER NOT NULL,
        duration_text TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        max_group_size INTEGER DEFAULT 10,
        included_features TEXT[] DEFAULT '{}',
        excluded_features TEXT[] DEFAULT '{}',
        itinerary JSONB DEFAULT '[]',
        image_url TEXT,
        available_dates TIMESTAMPTZ[] DEFAULT '{}',
        difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'challenging')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    console.log("[Tripsy] Created tour_packages table")

    // Seed destinations
    const destinationsCount = await client.query("SELECT COUNT(*) FROM destinations")
    if (Number.parseInt(destinationsCount.rows[0].count) === 0) {
      console.log("[Tripsy] Seeding destinations...")
      const seedDestinations = [
        {
          name: "Ancient Mossy Forest",
          slug: "ancient-mossy-forest",
          description:
            "Step into a realm where ancient trees tower above, their trunks wrapped in luminous moss and secrets. Sunlight filters through the canopy, illuminating pathways walked by forest spirits for centuries.",
          short_description: "Mystical forest with ancient trees and forest spirits",
          location: "Deep Mountain Region",
          region: "Northern Highlands",
          image_url: "/ancient-mossy-forest-ghibli.jpg",
          gallery_images: [
            "/ancient-mossy-forest-ghibli.jpg",
            "/ghibli-style-landscape-lush-green-clouds.jpg",
            "/japanese-countryside-totoro-house.jpg",
          ],
          highlights: [
            "Walk among 500-year-old trees",
            "Visit the Spirit Shrine",
            "Night walk with glowing mushrooms",
            "Traditional tea ceremony in forest clearing",
          ],
          best_time_to_visit: "Late Spring to Early Autumn",
          difficulty_level: "moderate",
          min_price: 320.0,
          max_price: 450.0,
          popularity_score: 95,
          total_reviews: 234,
          average_rating: 4.8,
        },
        {
          name: "Spirit Bathhouse District",
          slug: "spirit-bathhouse-district",
          description:
            "Experience the magical bathhouse district where spirits come to relax and rejuvenate. Traditional architecture meets otherworldly hospitality in this enchanted hot spring town.",
          short_description: "Magical hot springs and traditional bathhouse experience",
          location: "Mysterious Town",
          region: "Central Valley",
          image_url: "/ghibli-style-landscape-lush-green-clouds.jpg",
          gallery_images: ["/ghibli-style-landscape-lush-green-clouds.jpg", "/ghibli-train-over-water.jpg"],
          highlights: [
            "Luxury spirit bathhouse stay",
            "Herbal healing baths",
            "Spirit realm train ride",
            "Traditional kaiseki dinner",
          ],
          best_time_to_visit: "Year-round",
          difficulty_level: "easy",
          min_price: 450.0,
          max_price: 800.0,
          popularity_score: 98,
          total_reviews: 456,
          average_rating: 4.9,
        },
        {
          name: "Seaside Cliff Village",
          slug: "seaside-cliff-village",
          description:
            "A charming coastal town perched on dramatic cliffs overlooking the endless ocean. Red-roofed houses, winding cobblestone streets, and the fresh sea breeze create an unforgettable atmosphere.",
          short_description: "Picturesque coastal village with stunning ocean views",
          location: "Koriko Coast",
          region: "Western Shores",
          image_url: "/seaside-town-red-plane-ghibli.jpg",
          gallery_images: ["/seaside-town-red-plane-ghibli.jpg", "/clouds-pattern-texture.jpg"],
          highlights: [
            "Explore the old town bakery",
            "Sunset cliff walks",
            "Traditional fishing experience",
            "Seaplane sightseeing tour",
          ],
          best_time_to_visit: "Spring and Summer",
          difficulty_level: "easy",
          min_price: 280.0,
          max_price: 420.0,
          popularity_score: 92,
          total_reviews: 312,
          average_rating: 4.7,
        },
        {
          name: "Countryside Totoro Trail",
          slug: "countryside-totoro-trail",
          description:
            "Discover the peaceful countryside where soot sprites dance and forest guardians slumber. Walk through rice paddies, visit old shrines, and experience rural Japanese life.",
          short_description: "Rural countryside adventure with nature spirits",
          location: "Sayama Hills",
          region: "Eastern Plains",
          image_url: "/japanese-countryside-totoro-house.jpg",
          gallery_images: ["/japanese-countryside-totoro-house.jpg", "/ancient-mossy-forest-ghibli.jpg"],
          highlights: [
            "Stay in traditional farmhouse",
            "Giant camphor tree visit",
            "Rice planting experience",
            "Soot sprite hunt",
          ],
          best_time_to_visit: "Early Summer",
          difficulty_level: "easy",
          min_price: 250.0,
          max_price: 380.0,
          popularity_score: 88,
          total_reviews: 189,
          average_rating: 4.8,
        },
        {
          name: "Sky Castle Expedition",
          slug: "sky-castle-expedition",
          description:
            "Embark on an airship journey to the legendary floating castle. Explore ancient technology, lush hanging gardens, and witness the magic that keeps this wonder aloft.",
          short_description: "Airship adventure to a floating castle in the clouds",
          location: "The Sky",
          region: "Above the Clouds",
          image_url: "/clouds-pattern-texture.jpg",
          gallery_images: ["/clouds-pattern-texture.jpg", "/ghibli-train-over-water.jpg"],
          highlights: [
            "Airship flight experience",
            "Floating garden exploration",
            "Ancient robot guardians",
            "Cloud observatory visit",
          ],
          best_time_to_visit: "Late Spring to Early Fall",
          difficulty_level: "challenging",
          min_price: 800.0,
          max_price: 1200.0,
          popularity_score: 99,
          total_reviews: 567,
          average_rating: 5.0,
        },
      ]

      for (const dest of seedDestinations) {
        await client.query(
          `INSERT INTO destinations (
            name, slug, description, short_description, location, region, image_url, 
            gallery_images, highlights, best_time_to_visit, difficulty_level, 
            min_price, max_price, popularity_score, total_reviews, average_rating
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            dest.name,
            dest.slug,
            dest.description,
            dest.short_description,
            dest.location,
            dest.region,
            dest.image_url,
            dest.gallery_images,
            dest.highlights,
            dest.best_time_to_visit,
            dest.difficulty_level,
            dest.min_price,
            dest.max_price,
            dest.popularity_score,
            dest.total_reviews,
            dest.average_rating,
          ],
        )
      }
      console.log("[Tripsy] Seeded destinations")
    }

    // Update trigger for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS update_destinations_updated_at ON destinations;
      CREATE TRIGGER update_destinations_updated_at
      BEFORE UPDATE ON destinations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `)

    console.log("[Tripsy] Created triggers")
  } catch (err) {
    console.error("[Tripsy] Error creating destinations table:", err)
  } finally {
    await client.end()
    console.log("[Tripsy] Database migration complete")
  }
}

createDestinationsTable()
