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

    // 관계 이름 변경: emotionData -> emotions
    @OneToMany(() => Emotion, (emotion) => emotion.user)
    emotions: Emotion[]; // Emotion 엔티티의 'user' 필드와 연결
}