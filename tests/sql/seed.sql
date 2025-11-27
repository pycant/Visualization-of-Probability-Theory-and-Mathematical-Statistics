-- 基础种子数据
INSERT INTO admins (username, password) VALUES 
  ('admin', '$2y$10$vWcPSampleHashForAdminPasswordxxxxxxxxxxxxxxx');

INSERT INTO emails (email_address) VALUES 
  ('existing_user@example.com'),
  ('user2@example.com');
