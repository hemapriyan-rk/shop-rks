"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var superAdminExists, hash, serviceCount, services;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Seeding RKS database...');
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { username: 'admin' },
                        })];
                case 1:
                    superAdminExists = _a.sent();
                    if (!!superAdminExists) return [3 /*break*/, 4];
                    return [4 /*yield*/, bcrypt.hash('Admin@123', 12)];
                case 2:
                    hash = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: 'Super Admin',
                                username: 'admin',
                                passwordHash: hash,
                                role: 'SUPER_ADMIN',
                                isActive: true,
                            },
                        })];
                case 3:
                    _a.sent();
                    console.log('✅ Super Admin created (username: admin, password: Admin@123)');
                    return [3 /*break*/, 5];
                case 4:
                    console.log('⏭  Super Admin already exists — skipping.');
                    _a.label = 5;
                case 5: return [4 /*yield*/, prisma.service.count()];
                case 6:
                    serviceCount = _a.sent();
                    if (!(serviceCount === 0)) return [3 /*break*/, 8];
                    services = [
                        // Government Services
                        { name: 'Aadhaar Card Print', category: 'GOVT', price: 20 },
                        { name: 'Aadhaar Update / Correction', category: 'GOVT', price: 50 },
                        { name: 'PAN Card Apply (New)', category: 'GOVT', price: 120 },
                        { name: 'PAN Card Correction', category: 'GOVT', price: 100 },
                        { name: 'Birth Certificate', category: 'GOVT', price: 50 },
                        { name: 'Income Certificate', category: 'GOVT', price: 50 },
                        { name: 'Community Certificate', category: 'GOVT', price: 50 },
                        { name: 'Chitta / Patta Copy', category: 'GOVT', price: 30 },
                        { name: 'TNPDS Smart Card', category: 'GOVT', price: 50 },
                        { name: 'Voter ID Apply', category: 'GOVT', price: 50 },
                        { name: 'Voter ID Correction', category: 'GOVT', price: 30 },
                        { name: 'Driving License Apply', category: 'GOVT', price: 150 },
                        { name: 'Passport Apply Assistance', category: 'GOVT', price: 200 },
                        { name: 'UDID Certificate', category: 'GOVT', price: 50 },
                        { name: 'e-Seva / Form Submission', category: 'GOVT', price: 30 },
                        // Printing Services
                        { name: 'Black & White Print (A4)', category: 'PRINTING', price: 2 },
                        { name: 'Color Print (A4)', category: 'PRINTING', price: 10 },
                        { name: 'Black & White Print (A3)', category: 'PRINTING', price: 5 },
                        { name: 'Color Print (A3)', category: 'PRINTING', price: 20 },
                        { name: 'Photo Print (4x6)', category: 'PRINTING', price: 15 },
                        { name: 'Xerox (B&W per page)', category: 'PRINTING', price: 1 },
                        { name: 'Xerox (Color per page)', category: 'PRINTING', price: 8 },
                        { name: 'Lamination (A4)', category: 'PRINTING', price: 20 },
                        { name: 'Lamination (ID Card)', category: 'PRINTING', price: 10 },
                        { name: 'Spiral Binding', category: 'PRINTING', price: 30 },
                        { name: 'Scanning (per page)', category: 'PRINTING', price: 5 },
                        // Card Services
                        { name: 'Visiting Card (100 pcs)', category: 'CARDS', price: 150 },
                        { name: 'ID Card (Single)', category: 'CARDS', price: 50 },
                        { name: 'ID Card with Holder', category: 'CARDS', price: 70 },
                        { name: 'Banner Print (per sqft)', category: 'CARDS', price: 30 },
                        { name: 'Flex Print (per sqft)', category: 'CARDS', price: 25 },
                        { name: 'Invitation Card Design', category: 'CARDS', price: 100 },
                        // Other Services
                        { name: 'Email / WhatsApp Send', category: 'OTHER', price: 10 },
                        { name: 'Internet Browsing (30 min)', category: 'OTHER', price: 20 },
                        { name: 'Typing (per page Tamil)', category: 'OTHER', price: 30 },
                        { name: 'Typing (per page English)', category: 'OTHER', price: 20 },
                        { name: 'Form Filling Assistance', category: 'OTHER', price: 20 },
                        { name: 'Pen Drive Copy (per transfer)', category: 'OTHER', price: 10 },
                    ];
                    return [4 /*yield*/, prisma.service.createMany({
                            data: services.map(function (s) { return ({
                                name: s.name,
                                category: s.category,
                                price: s.price,
                                isActive: true,
                            }); }),
                        })];
                case 7:
                    _a.sent();
                    console.log("\u2705 ".concat(services.length, " default services seeded."));
                    return [3 /*break*/, 9];
                case 8:
                    console.log("\u23ED  Services already exist (".concat(serviceCount, " found) \u2014 skipping."));
                    _a.label = 9;
                case 9:
                    console.log('✅ Database seeding complete!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
