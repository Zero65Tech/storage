# Google Cloud Storage and File System Utility

This utility provides a seamless integration between the local file system (FS) and Google Cloud Storage (GCS). It is designed to simplify file operations by combining the functionalities of both systems, offering caching capabilities, and ensuring easy configuration across projects.

## Key Features

### 1. Dual File System Support

The utility seamlessly integrates file systems from both the local environment and Google Cloud Storage. Users can interact with files through a unified API, abstracting the complexities associated with different storage systems.

### 2. Caching Mechanism

An intelligent caching mechanism is employed to optimize performance. If a file exists in GCS, it is copied to the local file system during the initial access. Subsequent accesses retrieve the file from the local cache, eliminating the need for repeated downloads from GCS.

### 3. Flexible Initialization

During initialization, users can set the "mock" flag to either true or false:

- **Mock Mode (mock: true):** In this mode, the utility strictly works with the local file system, providing a convenient way for testing without interacting with Google Cloud Storage.

- **Non-Mock Mode (mock: false):** When the mock flag is set to false, the utility seamlessly operates with both the local file system and Google Cloud Storage. This allows for real-world usage in a production environment, combining the advantages of local storage and cloud-based storage.

## Usage

### Initialization

Initialize the utility with the desired configuration, including the GCS bucket and the mock flag:

```javascript
const storage = require('@zero65tech/storage');

// Mock Mode (Local FS Only)
storage.init({
  bucket: 'your-gcs-bucket-name',
  mock: true
});

// OR
// Non-Mock Mode (Both Local FS and GCS)
storage.init({
  bucket: 'your-gcs-bucket-name',
  mock: false
});
```

### File Operations

Once initialized, you can perform various file operations using the utility:

#### Reading a File

```javascript
const fileData = await storage.readFile('path/to/your/file.txt');
```

#### Writing a File

```javascript
const data = 'This is the content of the file.';
await storage.writeFile('path/to/your/file.txt', data, 'text/plain');
```

#### Creating Read and Write Streams

```javascript
const readStream = storage.createReadStream('path/to/your/file.txt');
const writeStream = storage.createWriteStream('path/to/your/file.txt', 'text/plain');
```

#### Deleting a File

```javascript
await storage.delete('path/to/your/file.txt');
```

