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
CREATE TABLE IF NOT EXISTS vehicles (
    vehicleid INT NOT NULL AUTO_INCREMENT,
    seller_userid INT,
    model VARCHAR(100),
    vehicleregistration VARCHAR(50) UNIQUE,
    dateofmanufacture DATE,
    price DECIMAL(10,2),
    kmdriven INT,
    engine VARCHAR(50),
    fueltype VARCHAR(30),
    transmission VARCHAR(30),
    color VARCHAR(30),
    mileage VARCHAR(30),
    description TEXT,
    status VARCHAR(30) DEFAULT 'Available',
    locationid INT,
    featured BOOLEAN DEFAULT FALSE,
    previewImage VARCHAR(255),
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (vehicleid),
    FOREIGN KEY (seller_userid) REFERENCES user(userid),
    FOREIGN KEY (locationid) REFERENCES location(locationid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vehicle Images Table
CREATE TABLE IF NOT EXISTS vehicleimage (
    ImageID INT AUTO_INCREMENT PRIMARY KEY,
    VehicleID INT,
    ImagePath VARCHAR(255),
    FOREIGN KEY (VehicleID) REFERENCES vehicles(vehicleid) ON DELETE CASCADE
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
    paymentdate DATETIME DEFAULT CURRENT_TIMESTAMP,
    paymentmode VARCHAR(50) DEFAULT 'Cash',
    paymentstatus VARCHAR(50) DEFAULT 'Pending',
    PRIMARY KEY (paymentid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders Table (Vehicle Orders)
CREATE TABLE IF NOT EXISTS orders (
    orderid INT NOT NULL AUTO_INCREMENT,
    vehicleid INT,
    buyer_userid INT,
    seller_userid INT,
    orderdate DATE,
    ordertime TIME,
    paymentid INT,
    status ENUM('pending','confirmed','completed','cancelled','Notified') DEFAULT 'pending',
    PRIMARY KEY (orderid),
    FOREIGN KEY (vehicleid) REFERENCES vehicles(vehicleid),
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

-- Services Table (Definitions)
CREATE TABLE IF NOT EXISTS services (
    serviceid INT NOT NULL AUTO_INCREMENT,
    servicename VARCHAR(100),
    description TEXT,
    price DECIMAL(10,2),
    centerid INT,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (serviceid),
    FOREIGN KEY (centerid) REFERENCES servicecenters(centerid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Service Bookings Table (Actual Bookings)
CREATE TABLE IF NOT EXISTS service_bookings (
    bookingid INT NOT NULL AUTO_INCREMENT,
    serviceid INT,
    userid INT,
    centerid INT,
    bookingdate DATE,
    bookingtime TIME,
    status VARCHAR(50) DEFAULT 'Pending',
    paymentid INT,
    vehicleid INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (bookingid),
    FOREIGN KEY (serviceid) REFERENCES services(serviceid),
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (centerid) REFERENCES servicecenters(centerid),
    FOREIGN KEY (vehicleid) REFERENCES vehicles(vehicleid),
    FOREIGN KEY (paymentid) REFERENCES payment(paymentid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert some default locations
INSERT INTO location (city, state, country) VALUES
('Mumbai', 'Maharashtra', 'India'),
('Delhi', 'Delhi', 'India'),
('Bangalore', 'Karnataka', 'India'),
('Chennai', 'Tamil Nadu', 'India'),
('Kolkata', 'West Bengal', 'India')
ON DUPLICATE KEY UPDATE city=city;

select * from location;

USE autotrade_db;



-- DROP PROCEDURE IF EXISTS place_order;

-- CREATE PROCEDURE place_order(
--     IN p_vehicleid INT,
--     IN p_buyerid INT,
--     IN p_sellerid INT
-- )
-- BEGIN
--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         ROLLBACK;
--         SELECT 'Error occurred while placing order' AS message;
--     END;

--     START TRANSACTION;

--     INSERT INTO orders (
--         vehicleid, 
--         buyer_userid, 
--         seller_userid, 
--         orderdate, 
--         ordertime
--     ) VALUES (
--         p_vehicleid, 
--         p_buyerid, 
--         p_sellerid, 
--         CURDATE(),
--         CURTIME()
--     );

--     COMMIT;
-- END //


DROP PROCEDURE IF EXISTS get_vehicles_by_price;

CREATE PROCEDURE get_vehicles_by_price(
    IN min_price DECIMAL(10,2),
    IN max_price DECIMAL(10,2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT 'Error fetching vehicles' AS message;
    END;

    IF min_price > max_price THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid price range';
    END IF;

    SELECT * FROM vehicles
    WHERE price BETWEEN min_price AND max_price;
END




--  Before Vehicle Insert → Validate Price + Timestamp + Calculate Age
DROP TRIGGER IF EXISTS before_vehicle_insert;
DROP TRIGGER IF EXISTS before_vehicle_insert_age;

CREATE TRIGGER before_vehicle_insert
BEFORE INSERT ON vehicles
FOR EACH ROW
BEGIN
    -- Set created timestamp
    SET NEW.created_at = NOW();

    -- Validate price
    IF NEW.price <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Price must be greater than 0';
    END IF;

    -- Validate manufacturing date
    IF NEW.dateofmanufacture > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid manufacturing date';
    END IF;

    -- Calculate vehicle age
    IF NEW.dateofmanufacture IS NOT NULL THEN
        SET NEW.age = TIMESTAMPDIFF(YEAR, NEW.dateofmanufacture, CURDATE());
    END IF;
END


--  Before Vehicle Update → Update Age
DROP TRIGGER IF EXISTS before_vehicle_update;

CREATE TRIGGER before_vehicle_update
BEFORE UPDATE ON vehicles
FOR EACH ROW
BEGIN
    IF NEW.dateofmanufacture IS NOT NULL THEN
        SET NEW.age = TIMESTAMPDIFF(YEAR, NEW.dateofmanufacture, CURDATE());
    END IF;
END



-- Prevent Duplicate Sale
DROP TRIGGER IF EXISTS prevent_duplicate_sale;

CREATE TRIGGER prevent_duplicate_sale
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);

    SELECT status INTO v_status
    FROM vehicles
    WHERE vehicleid = NEW.vehicleid;

    IF v_status = 'Sold' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Vehicle already sold';
    END IF;
END //

