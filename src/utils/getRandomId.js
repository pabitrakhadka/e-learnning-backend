const getRandomId = (array) => {
    console.log("come array", array);
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

export { getRandomId };