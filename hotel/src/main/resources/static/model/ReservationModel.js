/**
 * ReservationModel
 * Represents a hotel reservation/booking in Hotel Lanka
 */
export class ReservationModel {
    constructor(id, customerId, customerName, roomId, roomNumber, checkInDate, checkOutDate, totalAmount, status = 'CONFIRMED') {
        this._id = id;
        this._customerId = customerId;
        this._customerName = customerName;
        this._roomId = roomId;
        this._roomNumber = roomNumber;
        this._checkInDate = checkInDate;
        this._checkOutDate = checkOutDate;
        this._totalAmount = totalAmount;
        this._status = status; // CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
    }

    get id() { return this._id; }
    set id(v) { this._id = v; }

    get customerId() { return this._customerId; }
    set customerId(v) { this._customerId = v; }

    get customerName() { return this._customerName; }
    set customerName(v) { this._customerName = v; }

    get roomId() { return this._roomId; }
    set roomId(v) { this._roomId = v; }

    get roomNumber() { return this._roomNumber; }
    set roomNumber(v) { this._roomNumber = v; }

    get checkInDate() { return this._checkInDate; }
    set checkInDate(v) { this._checkInDate = v; }

    get checkOutDate() { return this._checkOutDate; }
    set checkOutDate(v) { this._checkOutDate = v; }

    get totalAmount() { return this._totalAmount; }
    set totalAmount(v) { this._totalAmount = v; }

    get status() { return this._status; }
    set status(v) { this._status = v; }

    toJSON() {
        return {
            id: this._id,
            customerId: this._customerId,
            customerName: this._customerName,
            roomId: this._roomId,
            roomNumber: this._roomNumber,
            checkInDate: this._checkInDate,
            checkOutDate: this._checkOutDate,
            totalAmount: this._totalAmount,
            status: this._status
        };
    }

    static fromJSON(json) {
        return new ReservationModel(
            json.id,
            json.customerId,
            json.customerName,
            json.roomId,
            json.roomNumber,
            json.checkInDate,
            json.checkOutDate,
            json.totalAmount,
            json.status
        );
    }
}

