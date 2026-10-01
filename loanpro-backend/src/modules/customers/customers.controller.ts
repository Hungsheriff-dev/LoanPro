import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { CustomersService } from './customers.service';
  import { CreateCustomerDto } from './dto/create-customer.dto';
  import { UpdateCustomerDto } from './dto/update-customer.dto';
  import { Roles } from '../auth/decorators/roles.decorator';
  
  @Controller('customers')
  export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}
  
    // Chỉ CREDIT_OFFICER, MANAGER, ADMIN được tạo khách hàng
    @Roles('CREDIT_OFFICER', 'MANAGER', 'ADMIN')
    @Post()
    create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
      return this.customersService.create(createCustomerDto, req.user.userId);
    }
  
    // Tất cả nhân viên đều xem được danh sách
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get()
    findAll() {
      return this.customersService.findAll();
    }
  
    // Tìm theo mã khách hàng (CUS-xxxxx)
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get('code/:customerId')
    findByCustomerId(@Param('customerId') customerId: string) {
      return this.customersService.findByCustomerId(customerId);
    }

    // Xem chi tiết theo ID
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.customersService.findOne(id);
    }
  
    // Chỉ MANAGER và ADMIN được sửa
    @Roles('MANAGER', 'ADMIN')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
      return this.customersService.update(id, updateCustomerDto);
    }
  
    // Chỉ ADMIN được xóa
    @Roles('ADMIN')
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.customersService.remove(id);
    }
  }