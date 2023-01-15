const kebabize = (str) => {
    return str
        .split("")
        .map((letter, idx) => {
            return letter.toUpperCase() === letter
                ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
                : letter;
        })
        .join("");
};

export default (inquirer, data) => {
    return kebabize(data.AppName);
};
