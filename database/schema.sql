-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 15, 2026 at 03:06 PM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kolegahub_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `appreciations`
--

CREATE TABLE `appreciations` (
  `id` int(10) UNSIGNED NOT NULL,
  `label` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appreciations`
--

INSERT INTO `appreciations` (`id`, `label`) VALUES
(1, 'kinerja'),
(4, 'produktifitas'),
(2, 'projek'),
(5, 'responsif'),
(3, 'sikap');

-- --------------------------------------------------------

--
-- Table structure for table `milestones`
--

CREATE TABLE `milestones` (
  `id` int(10) UNSIGNED NOT NULL,
  `level` int(10) UNSIGNED NOT NULL,
  `target_points` int(10) UNSIGNED NOT NULL COMMENT 'Target feedback_exp',
  `reward_karma` int(10) UNSIGNED NOT NULL COMMENT 'Hadiah karma saat di-claim'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `milestones`
--

INSERT INTO `milestones` (`id`, `level`, `target_points`, `reward_karma`) VALUES
(1, 1, 50, 500),
(2, 2, 150, 1000),
(3, 3, 300, 2000);

-- --------------------------------------------------------

--
-- Table structure for table `redemptions`
--

CREATE TABLE `redemptions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `item_id` int(10) UNSIGNED NOT NULL,
  `points_spent` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  `redeemed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `redemptions`
--

INSERT INTO `redemptions` (`id`, `user_id`, `item_id`, `points_spent`, `status`, `redeemed_at`) VALUES
(1, 1, 1, 1000, 'completed', '2026-11-15 13:57:05'),
(2, 4, 2, 2500, 'pending', '2026-11-15 13:57:05');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `reviewer_id` int(10) UNSIGNED NOT NULL COMMENT 'User yang memberi ulasan',
  `reviewee_id` int(10) UNSIGNED NOT NULL COMMENT 'Kolega yang dinilai',
  `technical_score` tinyint(3) UNSIGNED NOT NULL COMMENT 'Technical & Execution Skills (1-5)',
  `collaboration_score` tinyint(3) UNSIGNED NOT NULL COMMENT 'Collaboration & Communication (1-5)',
  `problem_solving_score` tinyint(3) UNSIGNED NOT NULL COMMENT 'Problem Solving Under Pressure (1-5)',
  `mentorship_score` tinyint(3) UNSIGNED NOT NULL COMMENT 'Mentorship & Culture Contribution (1-5)',
  `comment` varchar(500) DEFAULT NULL COMMENT 'Ulasan opsional (maks 500 karakter)',
  `points_awarded` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Poin untuk reviewer (250, 500, 1000)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `reviewer_id`, `reviewee_id`, `technical_score`, `collaboration_score`, `problem_solving_score`, `mentorship_score`, `comment`, `points_awarded`, `created_at`) VALUES
(1, 1, 2, 5, 5, 4, 5, 'Desain selalu rapi dan komunikatif.', 500, '2026-11-15 13:57:05'),
(2, 3, 1, 4, 4, 5, 4, 'Cepat menyelesaikan bug kritis.', 250, '2026-11-15 13:57:05'),
(3, 2, 4, 5, 5, 5, 5, NULL, 1000, '2026-11-15 13:57:05'),
(4, 4, 1, 5, 4, 4, 5, 'Sangat membantu saat onboarding.', 500, '2026-11-15 13:57:05');

-- --------------------------------------------------------

--
-- Table structure for table `review_appreciations`
--

CREATE TABLE `review_appreciations` (
  `review_id` int(10) UNSIGNED NOT NULL,
  `appreciation_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `review_appreciations`
--

INSERT INTO `review_appreciations` (`review_id`, `appreciation_id`) VALUES
(1, 1),
(1, 3),
(2, 4),
(2, 5),
(3, 1),
(3, 2),
(3, 3),
(4, 3);

-- --------------------------------------------------------

--
-- Table structure for table `shop_items`
--

CREATE TABLE `shop_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `point_cost` int(10) UNSIGNED NOT NULL,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_items`
--

INSERT INTO `shop_items` (`id`, `name`, `image_url`, `point_cost`, `stock`, `is_active`) VALUES
(1, 'Voucher Kopi Kapal Api', NULL, 1000, 50, 1),
(2, 'Voucher Makan Siang', NULL, 2500, 20, 1),
(3, 'Merchandise Kaos', NULL, 5000, 10, 1);

-- --------------------------------------------------------

--
-- Table structure for table `titles`
--

CREATE TABLE `titles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `color_hex` varchar(20) NOT NULL DEFAULT '#6B7280' COMMENT 'Warna badge'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `titles`
--

INSERT INTO `titles` (`id`, `name`, `color_hex`) VALUES
(1, 'High Empathy', '#EC4899'),
(2, 'Code Wizard', '#8B5CF6'),
(3, 'Team Player', '#10B981'),
(4, 'Problem Solver', '#F59E0B'),
(5, 'Mentor', '#3B82F6');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Simpan hash (bcrypt/argon2), bukan plain text',
  `division` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `karma_balance` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Saldo poin saat ini',
  `feedback_exp` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Akumulasi exp untuk Milestone',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `division`, `avatar_url`, `karma_balance`, `feedback_exp`, `created_at`) VALUES
(1, 'Andi Pratama', 'andi@example.com', '$2y$10$placeholderhashplaceholderhashplaceholderhashplaceholde', 'Engineering', NULL, 2240, 20, '2026-11-15 13:57:05'),
(2, 'Sari Dewi', 'sari@example.com', '$2y$10$placeholderhashplaceholderhashplaceholderhashplaceholde', 'Design', NULL, 1500, 50, '2026-11-15 13:57:05'),
(3, 'Budi Santoso', 'budi@example.com', '$2y$10$placeholderhashplaceholderhashplaceholderhashplaceholde', 'Product', NULL, 800, 10, '2026-11-15 13:57:05'),
(4, 'Rina Wulandari', 'rina@example.com', '$2y$10$placeholderhashplaceholderhashplaceholderhashplaceholde', 'Engineering', NULL, 3100, 75, '2026-11-15 13:57:05');

-- --------------------------------------------------------

--
-- Table structure for table `user_milestones`
--

CREATE TABLE `user_milestones` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `milestone_id` int(10) UNSIGNED NOT NULL,
  `is_claimed` tinyint(1) NOT NULL DEFAULT 0,
  `claimed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_milestones`
--

INSERT INTO `user_milestones` (`id`, `user_id`, `milestone_id`, `is_claimed`, `claimed_at`) VALUES
(1, 2, 1, 1, '2026-11-15 13:57:05'),
(2, 4, 1, 1, '2026-11-15 13:57:05'),
(3, 4, 2, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_titles`
--

CREATE TABLE `user_titles` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `title_id` int(10) UNSIGNED NOT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = Visible, 0 = hanya Owned (maks 3 visible, validasi di aplikasi)',
  `display_order` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_titles`
--

INSERT INTO `user_titles` (`id`, `user_id`, `title_id`, `is_visible`, `display_order`) VALUES
(1, 1, 2, 1, 1),
(2, 1, 4, 1, 2),
(3, 1, 3, 0, 0),
(4, 2, 1, 1, 1),
(5, 2, 5, 0, 0),
(6, 4, 2, 1, 1),
(7, 4, 5, 1, 2);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_user_rating_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_user_rating_summary` (
`user_id` int(10) unsigned
,`name` varchar(100)
,`total_reviews` bigint(21)
,`avg_technical` decimal(5,1)
,`avg_collaboration` decimal(5,1)
,`avg_problem_solving` decimal(5,1)
,`avg_mentorship` decimal(5,1)
,`avg_overall` decimal(8,1)
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appreciations`
--
ALTER TABLE `appreciations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_appreciations_label` (`label`);

--
-- Indexes for table `milestones`
--
ALTER TABLE `milestones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_milestones_level` (`level`);

--
-- Indexes for table `redemptions`
--
ALTER TABLE `redemptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_red_user` (`user_id`),
  ADD KEY `idx_red_item` (`item_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reviews_reviewee` (`reviewee_id`),
  ADD KEY `idx_reviews_reviewer` (`reviewer_id`),
  ADD KEY `idx_reviews_created` (`created_at`);

--
-- Indexes for table `review_appreciations`
--
ALTER TABLE `review_appreciations`
  ADD PRIMARY KEY (`review_id`,`appreciation_id`),
  ADD KEY `idx_ra_appreciation` (`appreciation_id`);

--
-- Indexes for table `shop_items`
--
ALTER TABLE `shop_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_shop_active` (`is_active`);

--
-- Indexes for table `titles`
--
ALTER TABLE `titles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_titles_name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_division` (`division`);

--
-- Indexes for table `user_milestones`
--
ALTER TABLE `user_milestones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_milestone` (`user_id`,`milestone_id`),
  ADD KEY `idx_um_milestone` (`milestone_id`);

--
-- Indexes for table `user_titles`
--
ALTER TABLE `user_titles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_title` (`user_id`,`title_id`),
  ADD KEY `idx_user_titles_visible` (`user_id`,`is_visible`,`display_order`),
  ADD KEY `fk_ut_title` (`title_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appreciations`
--
ALTER TABLE `appreciations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `milestones`
--
ALTER TABLE `milestones`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `redemptions`
--
ALTER TABLE `redemptions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shop_items`
--
ALTER TABLE `shop_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `titles`
--
ALTER TABLE `titles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_milestones`
--
ALTER TABLE `user_milestones`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_titles`
--
ALTER TABLE `user_titles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

-- --------------------------------------------------------

--
-- Structure for view `v_user_rating_summary`
--
DROP TABLE IF EXISTS `v_user_rating_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_user_rating_summary`  AS SELECT `u`.`id` AS `user_id`, `u`.`name` AS `name`, count(`r`.`id`) AS `total_reviews`, round(avg(`r`.`technical_score`),1) AS `avg_technical`, round(avg(`r`.`collaboration_score`),1) AS `avg_collaboration`, round(avg(`r`.`problem_solving_score`),1) AS `avg_problem_solving`, round(avg(`r`.`mentorship_score`),1) AS `avg_mentorship`, round(avg((`r`.`technical_score` + `r`.`collaboration_score` + `r`.`problem_solving_score` + `r`.`mentorship_score`) / 4),1) AS `avg_overall` FROM (`users` `u` left join `reviews` `r` on(`r`.`reviewee_id` = `u`.`id`)) GROUP BY `u`.`id`, `u`.`name` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `redemptions`
--
ALTER TABLE `redemptions`
  ADD CONSTRAINT `fk_red_item` FOREIGN KEY (`item_id`) REFERENCES `shop_items` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_red_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_rev_reviewee` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rev_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `review_appreciations`
--
ALTER TABLE `review_appreciations`
  ADD CONSTRAINT `fk_ra_appreciation` FOREIGN KEY (`appreciation_id`) REFERENCES `appreciations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ra_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_milestones`
--
ALTER TABLE `user_milestones`
  ADD CONSTRAINT `fk_um_milestone` FOREIGN KEY (`milestone_id`) REFERENCES `milestones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_um_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_titles`
--
ALTER TABLE `user_titles`
  ADD CONSTRAINT `fk_ut_title` FOREIGN KEY (`title_id`) REFERENCES `titles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ut_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
