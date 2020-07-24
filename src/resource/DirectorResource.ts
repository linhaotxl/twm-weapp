export enum EDirectorState {
    ADD,
    DELETE
}

export class DirectorResource {
    pathA: string;
    pathD: string;
    state: EDirectorState;
    
    constructor ( pathA: string, pathD: string, state: EDirectorState ) {
        this.pathA = pathA;
        this.pathD = pathD;
        this.state = state;
    }

    isAdd () {
        return this.state === EDirectorState.ADD;
    }

    isDelete () {
        return this.state === EDirectorState.DELETE;
    }
}