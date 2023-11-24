drop schema if exists `mentee-union`;

-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mentee-union
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mentee-union
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mentee-union` DEFAULT CHARACTER SET utf8 ;
USE `mentee-union` ;

-- -----------------------------------------------------
-- Table `mentee-union`.`grade`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`grade` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` TEXT NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `grade_id` INT NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(45) NOT NULL,
  `birth` DATE NOT NULL,
  `gender` TINYINT(10) NOT NULL DEFAULT 0,
  `password` VARCHAR(150) NOT NULL,
  `level` INT NOT NULL DEFAULT 0,
  `points` INT NOT NULL DEFAULT 0,
  `fail_login_count` INT NULL DEFAULT 0,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `status` VARCHAR(45) NOT NULL DEFAULT 'logout',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE,
  INDEX `fk_user_grade1_idx` (`grade_id` ASC) VISIBLE,
  CONSTRAINT `fk_user_grade1`
    FOREIGN KEY (`grade_id`)
    REFERENCES `mentee-union`.`grade` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`forum`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`forum` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(50) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_forums_user_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_forums_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `mentee-union`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` TEXT NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`seminar`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`seminar` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `host_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(50) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `meeting_place` VARCHAR(150) NOT NULL,
  `limit_participant_amount` INT NOT NULL DEFAULT 0,
  `recruit_start_date` TIMESTAMP NOT NULL,
  `recruit_end_date` TIMESTAMP NOT NULL,
  `seminar_start_date` TIMESTAMP NOT NULL,
  `seminar_end_date` TIMESTAMP NOT NULL,
  `is_recruit_finished` TINYINT NOT NULL DEFAULT 0,
  `is_seminar_finished` TINYINT NOT NULL DEFAULT 0,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_seminars_host1_idx` (`host_id` ASC) VISIBLE,
  INDEX `fk_seminar_category1_idx` (`category_id` ASC) VISIBLE,
  CONSTRAINT `fk_seminar_host1`
    FOREIGN KEY (`host_id`)
    REFERENCES `mentee-union`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_seminar_category1`
    FOREIGN KEY (`category_id`)
    REFERENCES `mentee-union`.`category` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`seminar_participant`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`seminar_participant` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `seminar_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `is_confirm` TINYINT NOT NULL DEFAULT 0,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `fk_seminars_has_users_users1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_seminars_has_users_seminars1_idx` (`seminar_id` ASC) VISIBLE,
  PRIMARY KEY (`id`, `user_id`, `seminar_id`),
  CONSTRAINT `fk_seminar_has_user_seminar1`
    FOREIGN KEY (`seminar_id`)
    REFERENCES `mentee-union`.`seminar` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_seminar_has_user_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `mentee-union`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`mentor-matches`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`mentor-matches` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`channel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`channel` (
  `id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `url` VARCHAR(200) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`mentoring_session`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`mentoring_session` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `channel_id` INT NOT NULL,
  `topic` VARCHAR(50) NOT NULL,
  `objective` VARCHAR(100) NOT NULL,
  `format` VARCHAR(30) NOT NULL,
  `note` VARCHAR(200) NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_mento-mentee-session_category1_idx` (`category_id` ASC) VISIBLE,
  INDEX `fk_mentoring_session_channel1_idx` (`channel_id` ASC) VISIBLE,
  CONSTRAINT `fk_mento-mentee-session_category1`
    FOREIGN KEY (`category_id`)
    REFERENCES `mentee-union`.`category` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_mentoring_session_channel1`
    FOREIGN KEY (`channel_id`)
    REFERENCES `mentee-union`.`channel` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`mentoring`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`mentoring` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mentor_id` INT NOT NULL,
  `mentee_id` INT NOT NULL,
  `mentoring_session_id` INT NOT NULL,
  `status` VARCHAR(45) NOT NULL DEFAULT 'waiting',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`, `mentor_id`, `mentee_id`, `mentoring_session_id`),
  INDEX `fk_mentor_mentee_matches_mento_mentee_users2_idx` (`mentee_id` ASC) VISIBLE,
  INDEX `fk_mentor_mentee_matches_mento_mentee_users1_idx` (`mentor_id` ASC) VISIBLE,
  INDEX `fk_mentor_mentee_matches_mento_mentee_session1_idx` (`mentoring_session_id` ASC) VISIBLE,
  CONSTRAINT `fk_mentor_mentee_matches_mento_mentee_users1`
    FOREIGN KEY (`mentor_id`)
    REFERENCES `mentee-union`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_mentor_mentee_matches_mento_mentee_users2`
    FOREIGN KEY (`mentee_id`)
    REFERENCES `mentee-union`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_mentor_mentee_matches_mento_mentee_session1`
    FOREIGN KEY (`mentoring_session_id`)
    REFERENCES `mentee-union`.`mentoring_session` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`user_recommend`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`user_recommend` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `giver_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `points` INT NOT NULL DEFAULT 1,
  `reason` VARCHAR(300) NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`, `giver_id`, `receiver_id`),
  INDEX `fk_users_has_users_users3_idx` (`receiver_id` ASC) VISIBLE,
  INDEX `fk_users_has_users_users2_idx` (`giver_id` ASC) VISIBLE,
  CONSTRAINT `fk_users_has_users_users2`
    FOREIGN KEY (`giver_id`)
    REFERENCES `mentee-union`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_has_users_users3`
    FOREIGN KEY (`receiver_id`)
    REFERENCES `mentee-union`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`interest`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`interest` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(150) NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `fk_interest_user1_idx` (`user_id` ASC) VISIBLE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_interest_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `mentee-union`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`terms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`terms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mentee-union`.`allow_terms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mentee-union`.`allow_terms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `terms_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `agree` TINYINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`, `terms_id`, `user_id`),
  INDEX `fk_terms_has_user_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_terms_has_user_terms1_idx` (`terms_id` ASC) VISIBLE,
  CONSTRAINT `fk_terms_has_user_terms1`
    FOREIGN KEY (`terms_id`)
    REFERENCES `mentee-union`.`terms` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_terms_has_user_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `mentee-union`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
