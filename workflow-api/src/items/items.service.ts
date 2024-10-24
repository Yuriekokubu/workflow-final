// items.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { In, Repository } from 'typeorm';
import { Item, ItemStatus } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>) {}

  create(createItemDto: CreateItemDto) {
    console.log('createItemDto', createItemDto)
    return this.itemRepository.save(createItemDto);
  }

  searchByIds(ids: number[]) {
    return this.itemRepository.find({ where: {
      id: In(ids)
    }});
  }

  searchByIdsNativeQuery(ids: number[]) {
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
    const query = `SELECT * FROM item WHERE id IN (${placeholders})`;
    console.log(query)
    return this.itemRepository.query(query, ids);
  } 


  findAll() {
    return this.itemRepository.find();
  }

  findOne(id: number) {
    return this.itemRepository.findOneBy({ id });
  }

  update(id: number, updateItemDto: UpdateItemDto) {    
    return this.itemRepository.save({ id, ...updateItemDto });
  }

  async remove(id: number) {
    const item = await this.itemRepository.findOneBy({ id })
    if (!item) {
      throw new NotFoundException(`Not found: id=${id}`)
    }
    return this.itemRepository.delete({ id })
  }

  async approve(id: number) {
    if (!id) {
      throw new NotFoundException(`id should not empty`)
    }

    const item = await this.itemRepository.findOneBy({ id })
    if (!item) {
      throw new NotFoundException(`not found: id={}`)
    }

    item.status = ItemStatus.APPROVED

    return await this.itemRepository.save(item)
  }

  async reject(id: number) {

    if (!id) {
      throw new NotFoundException(`id should not empty`)
    }

    const item = await this.itemRepository.findOneBy({ id })
    if (!item) {
      throw new NotFoundException(`not found: id={}`)
    }

    item.status = ItemStatus.REJECTED
    return await this.itemRepository.save(item)
  }
}
