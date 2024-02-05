import { Entity } from 'typeorm';
import { Integrant } from 'src/integrant/integrant.entity';

@Entity('integrants')
export class Admin extends Integrant {}