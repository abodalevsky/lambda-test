export const resp = (code, message, input) => {
    return {
        statusCode: code,
        body: JSON.stringify(
            {
                message,
                input,
            },
            null,
            2
        )
    };
};
