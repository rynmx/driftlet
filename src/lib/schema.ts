export const dbSchema = {
  users: {
    columns: {
      id: "UUID PRIMARY KEY DEFAULT uuid_generate_v4()",
      username: "TEXT NOT NULL UNIQUE",
      password: "TEXT NOT NULL",
      created_at: "TIMESTAMPTZ DEFAULT NOW()",
      name: "TEXT",
      bio: "TEXT",
      extended_bio: "TEXT",
      profile_picture_url: "TEXT",
      links: "JSONB",
      header_text: "TEXT DEFAULT 'driftlet'",
      header_icon_url: "TEXT",
      show_header_icon: "BOOLEAN DEFAULT true",
      recovery_passphrase: "TEXT",
      recovery_passphrase_created_at: "TIMESTAMPTZ",
    },
  },
  posts: {
    columns: {
      id: "UUID PRIMARY KEY DEFAULT uuid_generate_v4()",
      slug: "TEXT NOT NULL UNIQUE",
      title: "TEXT NOT NULL",
      content: "TEXT",
      created_at: "TIMESTAMPTZ DEFAULT NOW()",
      updated_at: "TIMESTAMPTZ DEFAULT NOW()",
      author_id: "UUID NOT NULL REFERENCES users(id)",
    },
  },
  tags: {
    columns: {
      id: "UUID PRIMARY KEY DEFAULT uuid_generate_v4()",
      name: "TEXT NOT NULL UNIQUE",
      created_at: "TIMESTAMPTZ DEFAULT NOW()",
    },
  },
  posts_tags: {
    columns: {
      post_id: "UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE",
      tag_id: "UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE",
    },
    constraints: "PRIMARY KEY (post_id, tag_id)",
  },
  settings: {
    columns: {
      id: "INT PRIMARY KEY DEFAULT 1",
      favicon_url: "TEXT",
      show_attribution: "BOOLEAN DEFAULT true",
    },
    constraints: "CONSTRAINT single_row CHECK (id = 1)",
  },
  query_metrics: {
    columns: {
      id: "UUID PRIMARY KEY DEFAULT uuid_generate_v4()",
      query_name: "TEXT NOT NULL",
      count: "INTEGER NOT NULL DEFAULT 0",
      total_time: "INTEGER NOT NULL DEFAULT 0", // milliseconds
      max_time: "INTEGER NOT NULL DEFAULT 0", // milliseconds
      min_time: "INTEGER NOT NULL DEFAULT 0", // milliseconds
      slow_queries: "INTEGER NOT NULL DEFAULT 0", // count of queries > threshold
      created_at: "TIMESTAMPTZ DEFAULT NOW()",
      updated_at: "TIMESTAMPTZ DEFAULT NOW()",
    },
    constraints: "UNIQUE(query_name)",
  },
  query_metrics_history: {
    columns: {
      id: "UUID PRIMARY KEY DEFAULT uuid_generate_v4()",
      query_name: "TEXT NOT NULL",
      count: "INTEGER NOT NULL",
      total_time: "INTEGER NOT NULL", // milliseconds
      avg_time: "INTEGER NOT NULL", // milliseconds
      max_time: "INTEGER NOT NULL", // milliseconds
      min_time: "INTEGER NOT NULL", // milliseconds
      slow_queries: "INTEGER NOT NULL",
      flush_timestamp: "TIMESTAMPTZ NOT NULL",
      created_at: "TIMESTAMPTZ DEFAULT NOW()",
    },
  },
};
