import crypto from "node:crypto";
import axios from "axios";
import { env } from "@/env";
import { GitHubUser } from "@/@types/github";

export async function generateGitHubAccessToken(
  code: string
): Promise<{ access_token?: string }> {
  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Access Token Error:", error.message);
      throw new Error("Failed to get access token from GitHub");
    }
    throw new Error("Unknown error while getting access token");
  }
}

export async function getGitHubUserInfo(
  gitHubAccessToken: string
): Promise<GitHubUser> {
  try {
    const response = await axios.get(`${env.GITHUB_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${gitHubAccessToken}`,
        Accept: "application/json",
        "User-Agent": "Node.js App",
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("User Info Error:", error.message);
      throw new Error("Failed to fetch user info from GitHub");
    }
    throw new Error("Unknown error while getting user info");
  }
}

export function generateRandomPassword(length = 12): string {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

export function encryptSymmetric(key: string, plaintext: string) {
  const iv = crypto.randomBytes(12).toString("base64");
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key, "base64"),
    Buffer.from(iv, "base64")
  );
  let ciphertext = cipher.update(plaintext, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const tag = cipher.getAuthTag();

  return { ciphertext, tag, iv };
}

export function decryptSymmetric(
  key: string,
  ciphertext: string,
  iv: string,
  tag: string
) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "base64"),
    Buffer.from(iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(tag, "base64"));

  let plaintext = decipher.update(ciphertext, "base64", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
}
