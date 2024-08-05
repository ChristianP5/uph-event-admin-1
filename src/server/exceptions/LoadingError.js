class LoadingError extends Error {
    constructor(message){
        super(message);
        this.errorCode = 404;
    }
}

module.exports = LoadingError;