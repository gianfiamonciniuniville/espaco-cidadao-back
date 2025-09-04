import { DataTypes, Model } from "sequelize";
import { ICustomer } from "../interfaces/customer";
import connection from "../config/database";

export class Customer extends Model<ICustomer> {
  declare idCliente: number;
  declare Nome: string;
  declare CPF: string;
  declare Telefone?: string;
  declare Email?: string;
  declare Created?: Date;
  declare Updated?: Date;
}

Customer.init(
  {
    idCliente: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    Nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    CPF: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    Telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Email: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    Created: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    Updated: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: connection,
    timestamps: true,
    tableName: "Cliente",
    createdAt: "Created",
    updatedAt: "Updated",
  },
);