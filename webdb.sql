-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2024 at 07:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webdb`
--
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `webdb`;

-- --------------------------------------------------------

--
-- Table structure for table `bookinghistory`
--

CREATE TABLE `bookinghistory` (
  `history_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `approver_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time_slot` enum('8-10','10-12','13-15','15-17') NOT NULL,
  `status` tinyint(16) NOT NULL COMMENT '0=Reject, 1=Approve  '
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookinghistory`
--

INSERT INTO `bookinghistory` (`history_id`, `booking_id`, `room_id`, `user_id`, `approver_id`, `date`, `time_slot`, `status`) VALUES
(1, 1, 1, 1, 4, '2024-04-21', '10-12', 0),
(2, 2, 2, 1, 3, '2024-04-21', '13-15', 1),
(3, 3, 1, 2, 3, '2024-04-22', '8-10', 0);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time_slot` enum('8-10','10-12','13-15','15-17') NOT NULL,
  `status` tinytext NOT NULL COMMENT '2=Pending, 1= Approved, 0=Rejected',
  `reason` text NOT NULL,
  `approver_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `room_id`, `user_id`, `date`, `time_slot`, `status`, `reason`, `approver_id`) VALUES
(1, 1, 1, '2024-04-21', '10-12', 'Pending', '', 2),
(2, 2, 1, '2024-04-21', '13-15', 'Pending', '', 3),
(3, 1, 2, '2024-04-22', '8-10', 'Pending', '', NULL),
(4, 1, 1, '2024-04-25', '8-10', 'Pending', 'Need a projector for presentation', NULL),
(19, 2, NULL, '2024-04-23', '', 'Pending', '', NULL),
(20, 2, NULL, '2024-04-23', '', 'Pending', '', NULL),
(21, 2, NULL, '2024-04-23', '', 'Pending', '', NULL),
(22, 2, NULL, '2024-04-23', '', 'Pending', '', NULL),
(23, 2, NULL, '2024-04-23', '', 'Pending', '', NULL),
(24, 2, NULL, '2024-04-23', '', 'Pending', '', NULL),
(25, 2, NULL, '2024-04-23', '', 'Pending', '', NULL),
(26, 2, NULL, '2024-04-23', '', 'Pending', '', NULL),
(27, 2, NULL, '2024-04-23', '', 'Pending', '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int(11) NOT NULL,
  `room_name` varchar(255) NOT NULL,
  `details` text NOT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `status_8_10` enum('Free','Reserved','Pending','Disabled') NOT NULL DEFAULT 'Free',
  `status_10_12` enum('Free','Reserved','Pending','Disabled') NOT NULL DEFAULT 'Free',
  `status_13_15` enum('Free','Reserved','Pending','Disabled') NOT NULL DEFAULT 'Free',
  `status_15_17` enum('Free','Reserved','Pending','Disabled') NOT NULL DEFAULT 'Free'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_name`, `details`, `enabled`, `status_8_10`, `status_10_12`, `status_13_15`, `status_15_17`) VALUES
(1, 'Room A', 'Capacity: 10, Projector: Yes', 1, 'Reserved', 'Free', 'Free', 'Free'),
(2, 'Room B', 'Capacity: 20, Projector: No', 1, 'Free', 'Pending', 'Free', 'Disabled'),
(3, 'Room C', 'Capacity: 5, Projector: Yes', 1, 'Free', 'Free', 'Free', 'Free');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` smallint(6) NOT NULL COMMENT '1=Student, 2=Approver, 3=Staff'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `firstname`, `lastname`, `username`, `password`, `role`) VALUES
(1, 'student1', '', 'student1', '$2b$10$ikRAg9e1IY0COyJHx77g0ug.iQ8XMlDlRNsSU3sE2No/kKcQ.oZZW', 1),
(2, 'approver1', '', 'approver1', '$2b$10$9Ekl5EGztC55jTqxR0Ip0uDXbIKiim12NhblQhckSk5TfnmS75f46', 2),
(3, 'staff1', '', 'staff1', '$2b$10$vVg7uXCr3cOAkYRgZEqDbOkxp9zHi.kwHK36B172Ds15jH7ZO7Z2O', 3),
(4, 'approver2', '', 'approver2', '$2b$10$yV7Z2pj8a7PQt9g4n/FTLeU3xUZgk1lf7GikPKXGJ7r2c8XhAyqzG\r\n', 2),
(101, 'Stanis', 'Tokarek', 'student2', '$2b$10$XzvDW7eg7u99v6R0EnKWN.oMwY2Yh2LVrwrfFHBQS4YI/fMiAmd2e', 1),
(107, '', '', 'staff2', '$2b$10$UEGPnh7hc6y24jK4CBQlEeMLptvfcDf8SIuVjc0cDvOivbTaUTl3.', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookinghistory`
--
ALTER TABLE `bookinghistory`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `approver_id` (`approver_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `approver_id` (`approver_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookinghistory`
--
ALTER TABLE `bookinghistory`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookinghistory`
--
ALTER TABLE `bookinghistory`
  ADD CONSTRAINT `bookinghistory_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  ADD CONSTRAINT `bookinghistory_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  ADD CONSTRAINT `bookinghistory_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `bookinghistory_ibfk_4` FOREIGN KEY (`approver_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`approver_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
