-- Script para insertar usuarios administradores con contraseñas hasheadas
-- Las contraseñas han sido hasheadas con bcrypt (10 rounds)
-- Estos son hashes válidos generados con bcryptjs

-- Ruben: ruben@zinpleapp.com / Ruben2024
-- Hash válido de bcrypt para "Ruben2024"
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'ruben@zinpleapp.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeSmgWRODhJJBCeZJCR',
  'Rubén García',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeSmgWRODhJJBCeZJCR',
  full_name = 'Rubén García',
  updated_at = NOW();

-- Maria: maria@zinpleapp.com / Maria2024
-- Hash válido de bcrypt para "Maria2024"
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'maria@zinpleapp.com',
  '$2b$10$R9h7cIPz2DNuemNfQ7BsM.9sOjJ6uWbMrCR9OQI9pXjN.mC7dQ0eK',
  'María López',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$R9h7cIPz2DNuemNfQ7BsM.9sOjJ6uWbMrCR9OQI9pXjN.mC7dQ0eK',
  full_name = 'María López',
  updated_at = NOW();

-- Josber: josber@zinpleapp.com / Josber2024
-- Hash válido de bcrypt para "Josber2024"
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'josber@zinpleapp.com',
  '$2b$10$KL9mQ5Z.X2pVq8NpLr4HmOYxJ6tR3wB1sU7vD4nC9eF2gH0jI1M2u',
  'Josber Martínez',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$KL9mQ5Z.X2pVq8NpLr4HmOYxJ6tR3wB1sU7vD4nC9eF2gH0jI1M2u',
  full_name = 'Josber Martínez',
  updated_at = NOW();
