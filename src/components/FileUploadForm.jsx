"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useCookies } from "react-cookie";

const FileUploadForm = ({ refetch }) => {
  const [cookies] = useCookies();
  const { register, handleSubmit, setValue } = useForm();

  const mutation = useMutation({
    mutationFn: (data) =>
      axios.post(`/api/upload?userId=${cookies.userId}`, data, {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
          "Content-Type": "application/json",
        },
      }),
    onSuccess: () => {
      refetch;
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ jsonData: data.jsonData });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      try {
        const jsonData = JSON.parse(text);
        setValue("jsonData", jsonData);
      } catch (error) {
        console.error("Invalid JSON file", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        Upload JSON File:
        <input type="file" accept=".json" onChange={handleFileChange} />
      </label>

      <input type="hidden" {...register("jsonData")} />

      <button type="submit" disabled={mutation.isLoading}>
        {mutation.isLoading ? "Uploading..." : "Submit"}
      </button>

      {mutation.isError && <p>Error occurred: {mutation.error.message}</p>}
      {mutation.isSuccess && <p>Data uploaded successfully!</p>}
    </form>
  );
};

export default FileUploadForm;
