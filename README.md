

https://github.com/user-attachments/assets/1468ec2a-71b6-4779-8a8a-2c13a2e1b061


# React Native MRZ Scanner

This project demonstrates a **Machine Readable Zone (MRZ)** scanner built with React Native. It allows users to scan MRZ data from passports, visas, and other travel documents using their device's camera. The scanner is powered by **Google ML Kit's text recognition**, making it efficient and capable of working offline.

## Features

- **Real-Time MRZ Scanning**: Captures MRZ data directly from the camera feed and processes it on the fly.
- **Offline Functionality**: The text recognition and MRZ parsing work without an internet connection, ensuring privacy and accessibility.
- **Accurate MRZ Parsing**: Extracts MRZ lines and converts them into structured data, such as:
  - Name
  - Document number
  - Date of birth
  - Expiration date
  - Nationality, and more.
- **Customizable and Reusable**: Designed to integrate seamlessly into other React Native projects.

## How It Works

1. The app uses the device's back camera for capturing document images.
2. The captured image is processed using **Google ML Kit's text recognition** to detect MRZ lines.
3. The detected MRZ lines are parsed into structured fields using the `mrz` library.
4. The extracted information is displayed in JSON format for easy debugging or further use.

---

This MRZ Scanner is ideal for developers looking to build or enhance apps requiring document scanning capabilities, such as visitor management systems, travel apps, or security solutions.
