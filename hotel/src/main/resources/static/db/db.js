/**
 * db.js - Central Database & Storage Service for Hotel Lanka
 * Persists data to localStorage with initial seeds matching the UI mockups.
 */

import { CustomerModel } from '../model/CustomerModel.js';
import { RoomModel } from '../model/RoomModel.js';
import { ReservationModel } from '../model/ReservationModel.js';

const STORAGE_KEYS = {
    CUSTOMERS: 'HOTEL_LANKA_CUSTOMERS',
    ROOMS: 'HOTEL_LANKA_ROOMS',
    RESERVATIONS: 'HOTEL_LANKA_RESERVATIONS',
    AUTH_TOKEN: 'HOTEL_LANKA_TOKEN',
    CURRENT_USER: 'HOTEL_LANKA_USER'
};

// Initial Seed Data matching screenshot exactly
const INITIAL_CUSTOMERS = [
    { id: 1, name: "Nimal Perera", email: "nimal@gmail.com", phone: "077 123 4567", nic: "200012345678", address: "Colombo, Sri Lanka" },
    { id: 2, name: "Kavindu Silva", email: "kavindu@gmail.com", phone: "071 234 5678", nic: "199912345678", address: "Kandy, Sri Lanka" },
    { id: 3, name: "Saman Weerasinghe", email: "saman@gmail.com", phone: "076 345 6789", nic: "198812345678", address: "Galle, Sri Lanka" },
    { id: 4, name: "Tharushi Fernando", email: "tharushi@gmail.com", phone: "070 456 7890", nic: "200112345678", address: "Negombo, Sri Lanka" },
    { id: 5, name: "Dinuka Jayawardena", email: "dinuka@gmail.com", phone: "075 567 8901", nic: "199812345678", address: "Jaffna, Sri Lanka" }
];

const INITIAL_ROOMS = [
    { id: 1, roomNumber: "101", roomType: "Deluxe Ocean View", pricePerNight: 25000, status: "AVAILABLE", floor: 1 },
    { id: 2, roomNumber: "102", roomType: "Executive Suite", pricePerNight: 45000, status: "OCCUPIED", floor: 1 },
    { id: 3, roomNumber: "201", roomType: "Standard King", pricePerNight: 18000, status: "AVAILABLE", floor: 2 },
    { id: 4, roomNumber: "202", roomType: "Deluxe Double", pricePerNight: 22000, status: "AVAILABLE", floor: 2 },
    { id: 5, roomNumber: "301", roomType: "Presidential Penthouse", pricePerNight: 85000, status: "OCCUPIED", floor: 3 },
    { id: 6, roomNumber: "302", roomType: "Standard Twin", pricePerNight: 16000, status: "MAINTENANCE", floor: 3 }
];

const INITIAL_RESERVATIONS = [
    { id: "RES-1001", customerId: 1, customerName: "Nimal Perera", roomId: 1, roomNumber: "101", checkInDate: "2026-09-08", checkOutDate: "2026-09-11", totalAmount: 75000, status: "CONFIRMED" },
    { id: "RES-1002", customerId: 2, customerName: "Kavindu Silva", roomId: 2, roomNumber: "102", checkInDate: "2026-09-05", checkOutDate: "2026-09-09", totalAmount: 180000, status: "CHECKED_IN" },
    { id: "RES-1003", customerId: 4, customerName: "Tharushi Fernando", roomId: 5, roomNumber: "301", checkInDate: "2026-09-06", checkOutDate: "2026-09-10", totalAmount: 340000, status: "CHECKED_IN" }
];

export class DB {
    static init() {
        if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
            localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
            localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
        }
    }

    // ================= CUSTOMER OPERATIONS =================
    static getAllCustomers() {
        this.init();
        const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
        return data.map(item => CustomerModel.fromJSON(item));
    }

    static getCustomerById(id) {
        const customers = this.getAllCustomers();
        return customers.find(c => String(c.id) === String(id)) || null;
    }

    static saveCustomer(customer) {
        const customers = this.getAllCustomers();
        const nextId = customers.length > 0 ? Math.max(...customers.map(c => Number(c.id))) + 1 : 1;
        customer.id = nextId;
        customers.push(customer);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers.map(c => c.toJSON())));
        return customer;
    }

    static updateCustomer(customer) {
        const customers = this.getAllCustomers();
        const index = customers.findIndex(c => String(c.id) === String(customer.id));
        if (index !== -1) {
            customers[index] = customer;
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers.map(c => c.toJSON())));
            return true;
        }
        return false;
    }

    static deleteCustomer(id) {
        let customers = this.getAllCustomers();
        const prevLength = customers.length;
        customers = customers.filter(c => String(c.id) !== String(id));
        if (customers.length < prevLength) {
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers.map(c => c.toJSON())));
            return true;
        }
        return false;
    }

    static syncCustomers(customers) {
        if (!Array.isArray(customers)) return;
        const mapped = customers.map(c => ({
            id: c.customerId || c.id,
            name: c.customerName || ((c.firstName || '') + ' ' + (c.lastName || '')).trim(),
            email: c.email || '',
            phone: c.contact || c.phone || '',
            nic: c.nicOrPassport || '',
            address: c.address || ''
        }));
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(mapped));
    }

    // ================= ROOM OPERATIONS =================
    static getAllRooms() {
        this.init();
        const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS)) || [];
        return data.map(item => RoomModel.fromJSON(item));
    }

    static getRoomById(id) {
        const rooms = this.getAllRooms();
        return rooms.find(r => String(r.id) === String(id)) || null;
    }

    static saveRoom(room) {
        const rooms = this.getAllRooms();
        const nextId = rooms.length > 0 ? Math.max(...rooms.map(r => Number(r.id))) + 1 : 1;
        room.id = nextId;
        rooms.push(room);
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms.map(r => r.toJSON())));
        return room;
    }

    static updateRoom(room) {
        const rooms = this.getAllRooms();
        const index = rooms.findIndex(r => String(r.id) === String(room.id));
        if (index !== -1) {
            rooms[index] = room;
            localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms.map(r => r.toJSON())));
            return true;
        }
        return false;
    }

    static deleteRoom(id) {
        let rooms = this.getAllRooms();
        const prevLength = rooms.length;
        rooms = rooms.filter(r => String(r.id) !== String(id));
        if (rooms.length < prevLength) {
            localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms.map(r => r.toJSON())));
            return true;
        }
        return false;
    }

    static syncRooms(rooms) {
        if (!Array.isArray(rooms)) return;
        const mapped = rooms.map(r => ({
            id: r.roomId || r.id,
            roomNumber: r.roomNumber,
            roomType: r.roomType || 'Deluxe Ocean View',
            pricePerNight: r.pricePerNight || r.price || 0,
            status: r.status || 'AVAILABLE',
            floor: r.floor || 1
        }));
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(mapped));
    }

    // ================= RESERVATION OPERATIONS =================
    static getAllReservations() {
        this.init();
        const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) || [];
        return data.map(item => ReservationModel.fromJSON(item));
    }

    static saveReservation(reservation) {
        const reservations = this.getAllReservations();
        const nextNum = reservations.length + 1001;
        reservation.id = `RES-${nextNum}`;
        reservations.push(reservation);
        localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations.map(r => r.toJSON())));
        return reservation;
    }

    static updateReservation(reservation) {
        const reservations = this.getAllReservations();
        const index = reservations.findIndex(r => String(r.id) === String(reservation.id));
        if (index !== -1) {
            reservations[index] = reservation;
            localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations.map(r => r.toJSON())));
            return true;
        }
        return false;
    }

    // ================= AUTH / USER SESSION =================
    static setToken(token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }

    static getToken() {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    static setCurrentUser(user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }

    static getCurrentUser() {
        const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : { username: 'Admin', role: 'ADMIN' };
    }

    static clearAuth() {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
}

