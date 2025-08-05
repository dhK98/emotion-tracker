import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum EmotionType {
    VERY_HAPPY = 'very-happy',
    HAPPY = 'happy',
    NEUTRAL = 'neutral',
    SAD = 'sad',
    ANGRY = 'angry',
}

@Entity('emotion_data')
export class Emotion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: EmotionType,
        nullable: false,
    })
    emotion: EmotionType;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @Column({ type: 'date', nullable: false })
    created_at: Date;

    @ManyToOne(() => User, (user) => user.emotionData)
    @JoinColumn({ name: 'user_id' })
    user: User;
}