/**
 * RoomModel
 * Represents a hotel room in Hotel Lanka
 */
export class RoomModel {
    constructor(id, roomNumber, roomType, pricePerNight, status = 'AVAILABLE', floor = 1) {
        this._id = id;
        this._roomNumber = roomNumber;
        this._roomType = roomType;
        this._pricePerNight = pricePerNight;
        this._status = status; // AVAILABLE, OCCUPIED, MAINTENANCE
        this._floor = floor;
    }

    get id() { return this._id; }
    set id(v) { this._id = v; }

    get roomNumber() { return this._roomNumber; }
    set roomNumber(v) { this._roomNumber = v; }

    get roomType() { return this._roomType; }
    set roomType(v) { this._roomType = v; }

    get pricePerNight() { return this._pricePerNight; }
    set pricePerNight(v) { this._pricePerNight = v; }

    get status() { return this._status; }
    set status(v) { this._status = v; }

    get floor() { return this._floor; }
    set floor(v) { this._floor = v; }

    toJSON() {
        return {
            id: this._id,
            roomNumber: this._roomNumber,
            roomType: this._roomType,
            pricePerNight: this._pricePerNight,
            status: this._status,
            floor: this._floor
        };
    }

    static fromJSON(json) {
        return new RoomModel(
            json.id,
            json.roomNumber,
            json.roomType,
            json.pricePerNight,
            json.status,
            json.floor
        );
    }
}

