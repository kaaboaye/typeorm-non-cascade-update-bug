import { PrimaryGeneratedColumn, Column, Entity } from "../../../../src";

@Entity()
export class Slave {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content: string;

}