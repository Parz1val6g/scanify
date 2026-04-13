import prisma from '../../shared/prisma.service';
import { Role } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return await (prisma.user as any).findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        status: true // Important for login checks
      }
    });
  }

  async createUserWithCompanyTransaction(userData: any, companyName: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Cria o utilizador base (chicken-and-egg avoidance for foreign key compliance)
      const user = await tx.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: Role.USER
        }
      });

      // 2. Cria a empresa associando o utilizador como dono absoluto
      const company = await tx.company.create({
        data: {
          name: companyName,
          userId: user.id
        } as any
      });

      // 3. Atualiza o registo do utilizador ligando a tenancy da empresa
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { companyId: company.id }
      });

      return updatedUser;
    });
  }

  async createUserForExistingCompany(userData: any, companyId: string) {
    return await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: Role.USER,
        companyId
      }
    });
  }

  async clearPasswordResets(userId: string) {
    return await prisma.passwordReset.deleteMany({ where: { userId } });
  }

  async createPasswordReset(data: { userId: string, token: string, expiresAt: Date }) {
    return await prisma.passwordReset.create({ data });
  }

  async findPasswordReset(token: string) {
    return await prisma.passwordReset.findUnique({ where: { token } });
  }

  async updatePasswordAndInvalidateToken(userId: string, hashedPw: string, token: string) {
    return await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPw }
      }),
      prisma.passwordReset.update({
        where: { token },
        data: { used: true }
      })
    ]);
  }
}
