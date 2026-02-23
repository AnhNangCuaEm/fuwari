-- User cart persistence: stores each logged-in user's cart items in the DB
-- so the cart survives device switches and incognito sessions.

CREATE TABLE IF NOT EXISTS user_carts (
  id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
  user_id     VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER     NOT NULL,
  quantity    INTEGER     NOT NULL CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);
