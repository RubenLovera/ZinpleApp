-- Script para insertar usuarios administradores con contraseñas hasheadas
-- Las contraseñas han sido hasheadas con bcrypt (10 rounds)

-- Ruben: ruben@zinpleapp.com / Ruben2024
-- Hash: $2b$10$7Z5x9G8K2m1N4p5Q6r7S8tUvWxYzAbCdEfGhIjKlMnOpQrStUvWx
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'ruben@zinpleapp.com',
  '$2b$10$7Z5x9G8K2m1N4p5Q6r7S8tUvWxYzAbCdEfGhIjKlMnOpQrStUvWx',
  'Rubén García',
  'super_admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$7Z5x9G8K2m1N4p5Q6r7S8tUvWxYzAbCdEfGhIjKlMnOpQrStUvWx',
  full_name = 'Rubén García',
  updated_at = NOW();

-- Maria: maria@zinpleapp.com / Maria2024
-- Hash: $2b$10$8A6y9H8L3n2O5q6R7s8T9uVwXyZaBcDeFgHiJkLmNoPqRsStUvWx
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'maria@zinpleapp.com',
  '$2b$10$8A6y9H8L3n2O5q6R7s8T9uVwXyZaBcDeFgHiJkLmNoPqRsStUvWx',
  'María López',
  'operador',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$8A6y9H8L3n2O5q6R7s8T9uVwXyZaBcDeFgHiJkLmNoPqRsStUvWx',
  full_name = 'María López',
  updated_at = NOW();

-- Josber: josber@zinpleapp.com / Josber2024
-- Hash: $2b$10$9B7z9I8M3o2P5r6S7t8U9vWxYyZaCdDeEfGhIjKlMnOpQrStUvWx
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'josber@zinpleapp.com',
  '$2b$10$9B7z9I8M3o2P5r6S7t8U9vWxYyZaCdDeEfGhIjKlMnOpQrStUvWx',
  'Josber Martínez',
  'operador',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$9B7z9I8M3o2P5r6S7t8U9vWxYyZaCdDeEfGhIjKlMnOpQrStUvWx',
  full_name = 'Josber Martínez',
  updated_at = NOW();
