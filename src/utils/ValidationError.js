import ApiError from "../utils/ApiError.js";

const ValidationError = (error) => {
    return new ApiError(422, "Validation Error", error.details[0].message);
};

export default ValidationError;