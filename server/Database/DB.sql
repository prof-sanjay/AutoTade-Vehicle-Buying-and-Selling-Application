-- AutoTrade Database Schema
-- Database: autotrade_db

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS autotrade_db;
USE autotrade_db;

-- Location Table
CREATE TABLE IF NOT EXISTS location (
    locationid INT NOT NULL AUTO_INCREMENT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    PRIMARY KEY (locationid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Table (Unified for buyers, sellers, and service centers)
CREATE TABLE IF NOT EXISTS user (
    userid INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','service_center','admin') DEFAULT 'user',
    name VARCHAR(255),
    email VARCHAR(255),
    phonenumber VARCHAR(20),
    address TEXT,
    locationid INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userid),
    FOREIGN KEY (locationid) REFERENCES location(locationid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Service Centers Table
CREATE TABLE IF NOT EXISTS servicecenters (
    centerid INT NOT NULL AUTO_INCREMENT,
    centername VARCHAR(100),
    locationid INT,
    contactnumber VARCHAR(20),
    userid INT,
    PRIMARY KEY (centerid),
    FOREIGN KEY (locationid) REFERENCES location(locationid),
    FOREIGN KEY (userid) REFERENCES user(userid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vehicle Table
CREATE TABLE IF NOT EXISTS vehicle (
    vehicleid INT NOT NULL AUTO_INCREMENT,
    seller_userid INT,
    make VARCHAR(50),
    model VARCHAR(50),
    vehicleregistration VARCHAR(50),
    dateofmanufacture DATE,
    price DECIMAL(10,2),
    kmdriven INT,
    engine VARCHAR(50),
    fueltype VARCHAR(30),
    transmission VARCHAR(30),
    color VARCHAR(30),
    mileage INT,
    description TEXT,
    status ENUM('available','sold','pending') DEFAULT 'available',
    locationid INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (vehicleid),
    FOREIGN KEY (seller_userid) REFERENCES user(userid),
    FOREIGN KEY (locationid) REFERENCES location(locationid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parts Table
CREATE TABLE IF NOT EXISTS parts (
    partid INT NOT NULL AUTO_INCREMENT,
    partname VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
    stock INT DEFAULT 0,
    centerid INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (partid),
    FOREIGN KEY (centerid) REFERENCES servicecenters(centerid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payment Table
CREATE TABLE IF NOT EXISTS payment (
    paymentid INT NOT NULL AUTO_INCREMENT,
    amount DECIMAL(10,2),
    paymentdate DATE,
    paymentmethod ENUM('cash','card','upi','bank_transfer') DEFAULT 'cash',
    status ENUM('pending','completed','failed') DEFAULT 'pending',
    PRIMARY KEY (paymentid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders Table (Vehicle Orders)
CREATE TABLE IF NOT EXISTS orders (
    orderid INT NOT NULL AUTO_INCREMENT,
    vehicleid INT,
    buyer_userid INT,
    seller_userid INT,
    orderdate DATE,
    paymentid INT,
    status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
    PRIMARY KEY (orderid),
    FOREIGN KEY (vehicleid) REFERENCES vehicle(vehicleid),
    FOREIGN KEY (buyer_userid) REFERENCES user(userid),
    FOREIGN KEY (seller_userid) REFERENCES user(userid),
    FOREIGN KEY (paymentid) REFERENCES payment(paymentid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Part Orders Table
CREATE TABLE IF NOT EXISTS part_orders (
    orderid INT NOT NULL AUTO_INCREMENT,
    partid INT,
    buyer_userid INT,
    centerid INT,
    orderdate DATE,
    paymentid INT,
    status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
    PRIMARY KEY (orderid),
    FOREIGN KEY (partid) REFERENCES parts(partid),
    FOREIGN KEY (buyer_userid) REFERENCES user(userid),
    FOREIGN KEY (centerid) REFERENCES servicecenters(centerid),
    FOREIGN KEY (paymentid) REFERENCES payment(paymentid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    serviceid INT NOT NULL AUTO_INCREMENT,
    servicename VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
    centerid INT,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (serviceid),
    FOREIGN KEY (centerid) REFERENCES servicecenters(centerid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Service Bookings Table
CREATE TABLE IF NOT EXISTS service_bookings (
    bookingid INT NOT NULL AUTO_INCREMENT,
    serviceid INT,
    userid INT,
    centerid INT,
    bookingdate DATE,
    bookingtime TIME,
    status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
    vehicleid INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (bookingid),
    FOREIGN KEY (serviceid) REFERENCES services(serviceid),
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (centerid) REFERENCES servicecenters(centerid),
    FOREIGN KEY (vehicleid) REFERENCES vehicle(vehicleid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert some default locations
INSERT INTO location (city, state, country) VALUES
('Mumbai', 'Maharashtra', 'India'),
('Delhi', 'Delhi', 'India'),
('Bangalore', 'Karnataka', 'India'),
('Chennai', 'Tamil Nadu', 'India'),
('Kolkata', 'West Bengal', 'India')
ON DUPLICATE KEY UPDATE city=city;
