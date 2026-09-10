/**
 * CustomerModel
 * Represents a customer record matching the Hotel Lanka specifications
 */
export class CustomerModel {
    constructor(id, name, email, phone, nic, address) {
        this._id = id;
        this._name = name;
        this._email = email;
        this._phone = phone;
        this._nic = nic;
        this._address = address;
    }

    get id() { return this._id; }
    set id(value) { this._id = value; }

    get name() { return this._name; }
    set name(value) { this._name = value; }

    get email() { return this._email; }
    set email(value) { this._email = value; }

    get phone() { return this._phone; }
    set phone(value) { this._phone = value; }

    get nic() { return this._nic; }
    set nic(value) { this._nic = value; }

    get address() { return this._address; }
    set address(value) { this._address = value; }

    toJSON() {
        return {
            id: this._id,
            name: this._name,
            email: this._email,
            phone: this._phone,
            nic: this._nic,
            address: this._address
        };
    }

    static fromJSON(json) {
        return new CustomerModel(
            json.id,
            json.name,
            json.email,
            json.phone,
            json.nic,
            json.address
        );
    }
}

