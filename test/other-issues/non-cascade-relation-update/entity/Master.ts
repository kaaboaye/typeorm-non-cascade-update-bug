import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "../../../../src";
import { Slave } from "./Slave";

@Entity()
export class Master {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    masterContent: string;

    @OneToOne(() => Slave, s => s.id, {
        eager: true,
    })
    @JoinColumn()
    slave!: Slave;

}
