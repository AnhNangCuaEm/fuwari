-- Full Database Translation Schema

-- translation keys
CREATE TABLE translation_keys (
  id SERIAL PRIMARY KEY,
  key_path VARCHAR(255) UNIQUE, -- 'common.login', 'products.addToCart'
  category VARCHAR(50), -- 'ui', 'content', 'product'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- translations
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  key_id INTEGER REFERENCES translation_keys(id),
  locale VARCHAR(5),
  value TEXT,
  context TEXT, -- Ghi chú cho translators
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(key_id, locale)
);

-- Index for performance
CREATE INDEX idx_translations_locale ON translations(locale);
CREATE INDEX idx_translations_key_locale ON translations(key_id, locale);

-- Sample data
INSERT INTO translation_keys (key_path, category) VALUES 
('common.login', 'ui'),
('common.signup', 'ui'),
('products.addToCart', 'ui');

INSERT INTO translations (key_id, locale, value) VALUES 
(1, 'en', 'Login'),
(1, 'ja', 'ログイン'),
(2, 'en', 'Sign Up'),
(2, 'ja', 'アカウント作成');
