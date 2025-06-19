import { Injectable, Get } from '@nestjs/common';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MascotasService {
 
  
  constructor(private readonly prismaService: PrismaService){}
 
  
  

  
}
