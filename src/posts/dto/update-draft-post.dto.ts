import { PartialType } from '@nestjs/swagger';
import { CreateDraftPostDto } from './create-draft-post.dto';

export class UpdateDraftPostDto extends PartialType(CreateDraftPostDto) {}
