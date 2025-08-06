import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";

// EmotionType을 export하여 다른 파일에서 사용할 수 있도록 합니다.
export enum EmotionType {
    VERY_HAPPY = 'very-happy',
    HAPPY = 'happy',
    NEUTRAL = 'neutral',
    SAD = 'sad',
    ANGRY = 'angry',
}

@Entity({ name: 'emotions' }) // DB 테이블 이름은 'emotions'
export class Emotion {
    @PrimaryGeneratedColumn('uuid') // UUID 타입의 ID 자동 생성
    id: string;

    @Column({
        type: 'enum', // TypeORM이 EmotionType enum을 DB의 ENUM 타입으로 매핑
        enum: EmotionType, // 사용할 TypeScript enum 지정
        nullable: false, // 필수 값
    })
    emotion: EmotionType; // TypeScript 타입도 EmotionType으로 명확히 지정

    @Column({ type: 'text', nullable: true, default: null }) // 감정 이유 (선택적, 기본값 null)
    reason: string | null; // null을 허용하도록 타입 명시

    // 'YYYY-MM-DD' 형식의 문자열로 저장될 감정 기록 날짜
    @Column({ type: 'varchar', length: 10, nullable: false })
    date: string;

    // 레코드 생성 시각 (DB에서 자동으로 타임스탬프 생성)
    @CreateDateColumn({ type: 'timestamp' }) // PostgreSQL은 'timestamptz', MySQL은 'timestamp' 또는 'datetime'
    createdAt: Date;

    // User 엔티티와의 다대일 관계 설정
    @ManyToOne(() => User, user => user.emotions, {
        onDelete: 'CASCADE', // User 삭제 시 관련 감정 기록도 삭제
    })
    @JoinColumn({ name: 'user_id' }) // DB에서 외래 키 컬럼 이름을 'user_id'로 지정
    user: User;
}