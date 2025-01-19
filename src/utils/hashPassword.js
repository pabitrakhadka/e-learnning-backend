import bcrypt from "bcrypt";

//Hasb password function
const hashPassword = async (plainPassword) => {
    const saltRound = 10;
    return await bcrypt.hash(plainPassword, saltRound);
}

//This is Veriry password
const verifyPassword = async (plainPassword, hashPassword) => {
    return await bcrypt.compare(plainPassword, hashPassword);
}


export { hashPassword, verifyPassword };