import mongoose from 'mongoose';

export interface ISymptom extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  symptoms: {
    cramps: number;
    headache: number;
    bloating: number;
    backPain: number;
    acne: number;
    breastTenderness: number;
    fatigue: number;
    nausea: number;
  };
  notes?: string;
}

const symptomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  symptoms: {
    cramps: { type: Number, min: 0, max: 3, default: 0 },
    headache: { type: Number, min: 0, max: 3, default: 0 },
    bloating: { type: Number, min: 0, max: 3, default: 0 },
    backPain: { type: Number, min: 0, max: 3, default: 0 },
    acne: { type: Number, min: 0, max: 3, default: 0 },
    breastTenderness: { type: Number, min: 0, max: 3, default: 0 },
    fatigue: { type: Number, min: 0, max: 3, default: 0 },
    nausea: { type: Number, min: 0, max: 3, default: 0 }
  },
  notes: { type: String }
}, { timestamps: true });

export const Symptom = mongoose.model<ISymptom>('Symptom', symptomSchema);