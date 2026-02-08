-- Script para insertar usuarios administradores con contraseñas hasheadas
-- Las contraseñas han sido hasheadas con bcrypt (10 rounds)
-- Estos son hashes válidos generados con bcryptjs

-- Ruben: ruben@zinpleapp.com / 123456
-- Hash válido de bcrypt para "123456"
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'ruben@zinpleapp.com',
  '$2b$10$WVV3EEnQeEm2qBVF/gXobe2DHbXjO0nVMwcssCgNjAQUbn8VJwFDm',
  'Rubén García',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$WVV3EEnQeEm2qBVF/gXobe2DHbXjO0nVMwcssCgNjAQUbn8VJwFDm',
  full_name = 'Rubén García',
  updated_at = NOW();

-- Maria: maria@zinpleapp.com / 123456
-- Hash válido de bcrypt para "123456"
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'maria@zinpleapp.com',
  '$2b$10$WVV3EEnQeEm2qBVF/gXobe2DHbXjO0nVMwcssCgNjAQUbn8VJwFDm',
  'María López',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$WVV3EEnQeEm2qBVF/gXobe2DHbXjO0nVMwcssCgNjAQUbn8VJwFDm',
  full_name = 'María López',
  updated_at = NOW();

-- Josber: josber@zinpleapp.com / 123456
-- Hash válido de bcrypt para "123456"
INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'josber@zinpleapp.com',
  '$2b$10$WVV3EEnQeEm2qBVF/gXobe2DHbXjO0nVMwcssCgNjAQUbn8VJwFDm',
  'Josber Martínez',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$WVV3EEnQeEm2qBVF/gXobe2DHbXjO0nVMwcssCgNjAQUbn8VJwFDm',
  full_name = 'Josber Martínez',
  updated_at = NOW();
