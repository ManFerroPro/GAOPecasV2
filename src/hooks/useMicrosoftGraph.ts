"use client";

import { Client } from "@microsoft/microsoft-graph-client";
import { useCallback } from "react";
import { useMicrosoftAuth } from "@/components/providers/MicrosoftAuthProvider";
import "isomorphic-fetch";

export function useMicrosoftGraph() {
  const { getToken } = useMicrosoftAuth();

  const getClient = useCallback(async () => {
    const token = await getToken();
    if (!token) return null;

    return Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });
  }, [getToken]);

  const findTeamByName = useCallback(async (teamName: string) => {
    const client = await getClient();
    if (!client) return null;

    try {
      const response = await client.api("/groups")
        .filter(`displayName eq '${teamName}'`)
        .select("id,displayName")
        .get();

      return response.value[0] || null;
    } catch (error) {
      console.error("Error finding team:", error);
      return null;
    }
  }, [getClient]);

  const getTeamDrive = useCallback(async (groupId: string) => {
    const client = await getClient();
    if (!client) return null;

    try {
      const response = await client.api(`/groups/${groupId}/drive`).get();
      return response;
    } catch (error) {
      console.error("Error getting team drive:", error);
      return null;
    }
  }, [getClient]);

  const findOrCreateFolder = useCallback(async (driveId: string, parentPath: string, folderName: string) => {
    const client = await getClient();
    if (!client) return null;

    try {
      // Try to find the folder first
      const searchPath = parentPath === "root" ? `/drives/${driveId}/root/children` : `/drives/${driveId}/root:/${parentPath}:/children`;
      const response = await client.api(searchPath)
        .filter(`name eq '${folderName}'`)
        .get();

      if (response.value.length > 0) {
        return response.value[0];
      }

      // Create it if not found
      const createPath = parentPath === "root" ? `/drives/${driveId}/root/children` : `/drives/${driveId}/root:/${parentPath}:/children`;
      const newFolder = await client.api(createPath).post({
        name: folderName,
        folder: {},
        "@microsoft.graph.conflictBehavior": "fail"
      });

      return newFolder;
    } catch (error) {
      console.error(`Error findOrCreateFolder (${folderName}):`, error);
      return null;
    }
  }, [getClient]);

  const ensureArticleStructure = useCallback(async (driveId: string, articleCode: string) => {
    // 1. Root article folder
    const articleFolder = await findOrCreateFolder(driveId, "root", articleCode);
    if (!articleFolder) return null;

    // 2. Fotos subfolder
    const fotosFolder = await findOrCreateFolder(driveId, articleCode, "Fotos");
    
    // 3. Documentos subfolder
    const docsFolder = await findOrCreateFolder(driveId, articleCode, "Documentos");

    return { articleFolder, fotosFolder, docsFolder };
  }, [findOrCreateFolder]);

  const uploadFileByPath = useCallback(async (driveId: string, path: string, file: File) => {
    const client = await getClient();
    if (!client) return null;

    try {
      // Use simple upload for small files
      const response = await client.api(`/drives/${driveId}/root:/${path}/${file.name}:/content`)
        .put(file);
      return response;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  }, [getClient]);

  return {
    findTeamByName,
    getTeamDrive,
    ensureArticleStructure,
    uploadFileByPath
  };
}
