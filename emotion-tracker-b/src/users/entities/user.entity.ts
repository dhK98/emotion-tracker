import { Emotion } from 'src/emotion/entities/emotion.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    loginId: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: false })
    name: string;

    @OneToMany(() => Emotion, (emotionData) => emotionData.user)
    emotionData: Emotion[];
}