import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) { }

  @Post()
  @Roles('ADMIN')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  create(@Body() createCharacterDto: any) {
    return this.charactersService.create(createCharacterDto);
  }

  @Get()
  findAll() {
    return this.charactersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.charactersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(@Param('id') id: string, @Body() updateCharacterDto: any) {
    return this.charactersService.update(+id, updateCharacterDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    return this.charactersService.remove(+id);
  }

  @Post('attack')
  async attack(
    @Body('attackerId') attackerId: number,
    @Body('targetId') targetId: number,
  ) {
    return this.charactersService.attack(attackerId, targetId);
  }

  @Post('reset')
  @Roles('ADMIN')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async resetAll() {
    return this.charactersService.resetAll();
  }
}
