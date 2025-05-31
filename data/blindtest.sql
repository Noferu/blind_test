USE ida_blindtest;

CREATE TABLE IF NOT EXISTS tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    youtube_url TEXT NOT NULL,
    added_by VARCHAR(255) DEFAULT NULL
);