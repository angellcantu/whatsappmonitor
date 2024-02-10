// import { Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Admin, Repository } from "typeorm";
// import { Phone } from "src/phone/phone.entity"
// import { IAdmin } from "./admin.interface";
// import { Integrant } from "src/integrant/integrant.entity";

// @Injectable()
// export class AdminService {
//     constructor(
//         @InjectRepository(Integrant)
//         private integrantRepository: Repository<Integrant>
//     ) { }

//     // async findAll(): Promise<Admin[]> {
//     //     // return this.adminRepository.find();
//     // }

//     // async findOne(admin_id: string): Promise<Admin | undefined> {
//     //     return this.adminRepository.findOne({ where: { integrant_id: admin_id } })
//     // }

//     async createAdmin(_admin: IAdmin): Promise<Admin> {
//         try {
//             const admin: Integrant = await this.integrantRepository.create(
//                 // name: 
//             )
//             await this.integrantRepository.save(admin);
//         } catch (error) {
//             console.log(error)
//         }
//         return
//     }

//     async createContacts(admins: any[], phone: Phone): Promise<void> {
//         // for (const contact of contacts) {
//         //     const contactInterface: IContact = {
//         //         contact_id: contact.id,
//         //         name: contact.name,
//         //         type: contact.type,
//         //         image: null,
//         //         phone: phone
//         //     }

//         //     await this.createContact(contactInterface);
//         // }
//     }
// }