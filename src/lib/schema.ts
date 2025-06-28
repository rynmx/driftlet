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
    indexes: [
      {
        name: "idx_users_created_at",
        columns: ["created_at"],
        comment: "Index for user registration chronology queries",
      },
    ],
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
    indexes: [
      {
        name: "idx_posts_created_at",
        columns: ["created_at"],
        comment:
          "Critical index for chronological post ordering (ORDER BY created_at DESC)",
      },
      {
        name: "idx_posts_author_id",
        columns: ["author_id"],
        comment: "Essential index for JOIN performance with users table",
      },
      {
        name: "idx_posts_updated_at",
        columns: ["updated_at"],
        comment: "Index for recently updated posts queries",
      },
    ],
  },
  tags: {
    columns: {
      id: "UUID PRIMARY KEY DEFAULT uuid_generate_v4()",
      name: "TEXT NOT NULL UNIQUE",
      created_at: "TIMESTAMPTZ DEFAULT NOW()",
    },
    indexes: [
      {
        name: "idx_tags_created_at",
        columns: ["created_at"],
        comment: "Index for tag creation chronology",
      },
    ],
  },
  posts_tags: {
    columns: {
      post_id: "UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE",
      tag_id: "UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE",
    },
    constraints: "PRIMARY KEY (post_id, tag_id)",
    indexes: [
      {
        name: "idx_posts_tags_post_id",
        columns: ["post_id"],
        comment:
          "Index for efficient tag lookups by post (already covered by PK but explicit for clarity)",
      },
      {
        name: "idx_posts_tags_tag_id",
        columns: ["tag_id"],
        comment: "Index for efficient post lookups by tag (reverse direction)",
      },
    ],
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
    indexes: [
      {
        name: "idx_query_metrics_total_time",
        columns: ["total_time"],
        comment: "Index for sorting queries by total execution time",
      },
      {
        name: "idx_query_metrics_slow_queries",
        columns: ["slow_queries"],
        comment: "Index for filtering queries with high slow query counts",
      },
    ],
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
    indexes: [
      {
        name: "idx_query_metrics_history_query_name",
        columns: ["query_name"],
        comment: "Index for filtering historical metrics by query name",
      },
      {
        name: "idx_query_metrics_history_flush_timestamp",
        columns: ["flush_timestamp"],
        comment:
          "Critical index for time-based filtering (WHERE flush_timestamp > NOW() - INTERVAL)",
      },
      {
        name: "idx_query_metrics_history_query_name_flush_timestamp",
        columns: ["query_name", "flush_timestamp"],
        comment:
          "Composite index for efficient query-specific historical lookups",
      },
    ],
  },
};
