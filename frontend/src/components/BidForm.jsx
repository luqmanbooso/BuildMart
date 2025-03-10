import React from "react";
import { useForm } from "react-hook-form";

const BidForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Bid Submitted:", data);
    alert("Bid Submitted Successfully!");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      <h2 className="text-lg font-bold mb-4">Bid Submission Form</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Project Name */}
        <div className="mb-4">
          <label htmlFor="projectName" className="block font-medium mb-1">
            Project Name:
          </label>
          <input
            id="projectName"
            {...register("projectName", { required: "Project name is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.projectName && (
            <p className="text-red-500 text-sm">{errors.projectName.message}</p>
          )}
        </div>

        {/* Contractor Name */}
        <div className="mb-4">
          <label htmlFor="contractorName" className="block font-medium mb-1">
            Contractor Name:
          </label>
          <input
            id="contractorName"
            {...register("contractorName", { required: "Contractor name is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.contractorName && (
            <p className="text-red-500 text-sm">{errors.contractorName.message}</p>
          )}
        </div>

        {/* Bid Amount */}
        <div className="mb-4">
          <label htmlFor="bidAmount" className="block font-medium mb-1">
            Bid Amount ($):
          </label>
          <input
            id="bidAmount"
            type="number"
            {...register("bidAmount", {
              required: "Bid amount is required",
              min: { value: 1, message: "Bid amount must be greater than $0" },
            })}
            className="w-full p-2 border rounded"
          />
          {errors.bidAmount && (
            <p className="text-red-500 text-sm">{errors.bidAmount.message}</p>
          )}
        </div>

        {/* Experience (Years) */}
        <div className="mb-4">
          <label htmlFor="experience" className="block font-medium mb-1">
            Experience (Years):
          </label>
          <input
            id="experience"
            type="number"
            {...register("experience", {
              required: "Experience is required",
              min: { value: 1, message: "Experience must be at least 1 year" },
            })}
            className="w-full p-2 border rounded"
          />
          {errors.experience && (
            <p className="text-red-500 text-sm">{errors.experience.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Submit Bid
        </button>
      </form>
    </div>
  );
};

export default BidForm;
