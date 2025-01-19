const handleMissingBodyError = () => {
    return new ApiError(400, "Body is missing!");
};

export default handleMissingBodyError;