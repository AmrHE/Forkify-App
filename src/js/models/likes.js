export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, image) {
        const like = { id, title, author, image };
        this.likes.push(like);

        //Persist a data in localStorage
        this.persistData();

        return like;
    }

    deleteLike(id) {
        const index = this.likes.findIndex(el => el.id === id);
        //Ex.
        // [2,4,8] splice(1, 2) -> returns [4, 8], original array is [2]
        // [2,4,8] slice(1, 2) -> returns 4, original array is [2,4,8]
        this.likes.splice(index, 1);

        //Persist a data in localStorage
        this.persistData();


    };

    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    };

    getLikesNumber() {
        return this.likes.length;
    };

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes));
    };

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));
        
        //Restore Likes From the localStorage
        if(storage) this.likes = storage;
    }
}