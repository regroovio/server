// s3.mjs

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from 'axios';

function encodeS3ObjectKey(key) {
    return key
        .split('/')
        .map((part) => encodeURIComponent(part).replace(/%2F/g, '/'))
        .join('/');
}

const saveTrackToS3 = async (item) => {
    const { stream, name, album, artist } = item;
    const client = new S3Client({ region: 'us-east-1' });
    const bucketName = `albums-regroovio`;
    const type = "mp3";
    try {
        const { data } = await axios.get(stream, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(data, 'binary');
        const key = `artists/${artist}/${album}/${name}.${type}`;
        const input = {
            Bucket: bucketName, // required
            Key: key, // required
            Expires: new Date(),
            Body: buffer,
            // CacheControl: "STRING_VALUE",
            // ContentDisposition: "STRING_VALUE",
            // ContentEncoding: "STRING_VALUE",
            // ContentLanguage: "STRING_VALUE",
            // ContentLength: Number("long"),
            // ContentMD5: "STRING_VALUE",
            // ContentType: "STRING_VALUE",
            // ChecksumAlgorithm: "CRC32" || "CRC32C" || "SHA1" || "SHA256",
            // ChecksumCRC32: "STRING_VALUE",
            // ChecksumCRC32C: "STRING_VALUE",
            // ChecksumSHA1: "STRING_VALUE",
            // ChecksumSHA256: "STRING_VALUE",
            // GrantFullControl: "STRING_VALUE",
            // GrantRead: "STRING_VALUE",
            // GrantReadACP: "STRING_VALUE",
            // GrantWriteACP: "STRING_VALUE",
            // ServerSideEncryption: "AES256" || "aws:kms",
            // StorageClass: "STANDARD" || "REDUCED_REDUNDANCY" || "STANDARD_IA" || "ONEZONE_IA" || "INTELLIGENT_TIERING" || "GLACIER" || "DEEP_ARCHIVE" || "OUTPOSTS" || "GLACIER_IR" || "SNOW",
            // WebsiteRedirectLocation: "STRING_VALUE",
            // SSECustomerAlgorithm: "STRING_VALUE",
            // SSECustomerKey: "STRING_VALUE",
            // SSECustomerKeyMD5: "STRING_VALUE",
            // SSEKMSKeyId: "STRING_VALUE",
            // SSEKMSEncryptionContext: "STRING_VALUE",
            // BucketKeyEnabled: true || false,
            // RequestPayer: "requester",
            // Tagging: "STRING_VALUE",
            // ObjectLockMode: "GOVERNANCE" || "COMPLIANCE",
            // ObjectLockRetainUntilDate: new Date("TIMESTAMP"),
            // ObjectLockLegalHoldStatus: "ON" || "OFF",
            // ExpectedBucketOwner: "STRING_VALUE",
            // Metadata: { // Metadata
            //     "<keys>": "STRING_VALUE",
            // },
        };
        const command = new PutObjectCommand(input);
        const response = await client.send(command);
        console.log(response);
        // get the url of the uploaded file
        const encodedKey = encodeS3ObjectKey(key);
        const s3ObjectUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${encodedKey}`;
        console.log(s3ObjectUrl);
        console.log(`Saved track to S3: ${s3ObjectUrl}`);
        return s3ObjectUrl;
    } catch (err) {
        console.error(`Error saving album to S3: ${err}`);
        return null;
    }
};

const saveImageToS3 = async (item) => {
    const { imageUrl, album, artist } = item;
    const client = new S3Client({ region: 'us-east-1' });
    const bucketName = `albums-regroovio`;
    const type = "jpg";
    try {
        const { data } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(data, 'binary');
        const key = `artists/${artist}/${album}/image.${type}`;
        const input = {
            Bucket: bucketName, // required
            Key: key, // required
            Expires: new Date(),
            Body: buffer,
            // CacheControl: "STRING_VALUE",
            // ContentDisposition: "STRING_VALUE",
            // ContentEncoding: "STRING_VALUE",
            // ContentLanguage: "STRING_VALUE",
            // ContentLength: Number("long"),
            // ContentMD5: "STRING_VALUE",
            // ContentType: "STRING_VALUE",
            // ChecksumAlgorithm: "CRC32" || "CRC32C" || "SHA1" || "SHA256",
            // ChecksumCRC32: "STRING_VALUE",
            // ChecksumCRC32C: "STRING_VALUE",
            // ChecksumSHA1: "STRING_VALUE",
            // ChecksumSHA256: "STRING_VALUE",
            // GrantFullControl: "STRING_VALUE",
            // GrantRead: "STRING_VALUE",
            // GrantReadACP: "STRING_VALUE",
            // GrantWriteACP: "STRING_VALUE",
            // ServerSideEncryption: "AES256" || "aws:kms",
            // StorageClass: "STANDARD" || "REDUCED_REDUNDANCY" || "STANDARD_IA" || "ONEZONE_IA" || "INTELLIGENT_TIERING" || "GLACIER" || "DEEP_ARCHIVE" || "OUTPOSTS" || "GLACIER_IR" || "SNOW",
            // WebsiteRedirectLocation: "STRING_VALUE",
            // SSECustomerAlgorithm: "STRING_VALUE",
            // SSECustomerKey: "STRING_VALUE",
            // SSECustomerKeyMD5: "STRING_VALUE",
            // SSEKMSKeyId: "STRING_VALUE",
            // SSEKMSEncryptionContext: "STRING_VALUE",
            // BucketKeyEnabled: true || false,
            // RequestPayer: "requester",
            // Tagging: "STRING_VALUE",
            // ObjectLockMode: "GOVERNANCE" || "COMPLIANCE",
            // ObjectLockRetainUntilDate: new Date("TIMESTAMP"),
            // ObjectLockLegalHoldStatus: "ON" || "OFF",
            // ExpectedBucketOwner: "STRING_VALUE",
            // Metadata: { // Metadata
            //     "<keys>": "STRING_VALUE",
            // },
        };
        const command = new PutObjectCommand(input);
        const response = await client.send(command);
        console.log(response);
        // get the url of the uploaded file
        const encodedKey = encodeS3ObjectKey(key);
        const s3ObjectUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${encodedKey}`;
        console.log(s3ObjectUrl);
        console.log(`Saved image to S3: ${s3ObjectUrl}`);
        return s3ObjectUrl;
    } catch (err) {
        console.error(`Error saving image to S3: ${err}`);
        return null;
    }
};

export { saveTrackToS3, saveImageToS3 };
