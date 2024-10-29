"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Button } from "antd";
import { MdOutlineDriveFolderUpload } from "react-icons/md";

const YourComponent = ({ refetch }) => {
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 flex gap-4 items-center"
    >
      <MdOutlineDriveFolderUpload size={25} />
      <label>Upload JSON File: </label>
      <input type="file" accept=".json" onChange={handleFileChange} />

      <input type="hidden" {...register("jsonData")} />
      <Button
        className="border border-black bg-white"
        type="submit"
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? "Uploading..." : "Submit"}
      </Button>

      {mutation.isError && <p>Error occurred: {mutation.error.message}</p>}
      {mutation.isSuccess && <p>Data uploaded successfully!</p>}
    </form>
  );
};

export default YourComponent;
